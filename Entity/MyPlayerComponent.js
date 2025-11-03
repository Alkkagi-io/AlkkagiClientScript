const MyPlayerComponent = pc.createScript('myPlayerComponent');

MyPlayerComponent.prototype.initialize = function () {
    this.atkDirGroup = this.entity.findByName('AtkDirGroup');
    this.atkChagingInner = this.entity.findByName('InnerArrow');
    this.atkCoolTimeGauge = this.entity.findByName('AtkCooltimeGauge');
    this.atkCoolTimeGauge.script.dynamicGaugeElement.maxValue = 1;
    this.score = 0;
    this.level = 1;
    this.isMyPlayer = false;
    this._cameraRegistered = false;
    this.charging = false;
    this.canAttack = true;
    this.atkCooltime = 0;
    this.remainAtkCooltime = 0;
    this.chargingTime = 0;

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this, 100);

    const characterEntityComponent = this.entity.script.characterEntityComponent;
    characterEntityComponent.getEvents().on('onDie', this.onDie, this);

    // 엔티티 파괴 시 카메라 타깃 해제
    this.entity.once('destroy', this.onEntityDestroyed, this);
}

// MyPlayerComponent.prototype.postUpdate = function(dt) {
//     const cameraPosition = gameManager.mainCamera.getPosition();
//     cameraPosition.x = this.entity.getPosition().x;
//     cameraPosition.y = this.entity.getPosition().y;
//     gameManager.mainCamera.setPosition(cameraPosition);
// };

MyPlayerComponent.prototype.update = function (dt) {
    if (this.charging) {
        this.chargingTime += dt;
        if(this.isChargingValid() == false) {
            this.handleChargingEnd();
        }
    } else {
        this.updateCooltime(dt);
    }
}

MyPlayerComponent.prototype.isChargingValid = function() {
    if(this.chargingTime < 0.5)
        return true;
    
    const moveComponent = this.entity.script.entityMoveComponent;
    return moveComponent.getVelocity().lengthSq() <= MOVE_THRESHOLD;
};

MyPlayerComponent.prototype.updateCooltime = function(dt) {
    if (this.remainAtkCooltime <= 0) 
        return;

    this.remainAtkCooltime -= dt;

    const ratio = this.remainAtkCooltime / this.atkCooltime;
    this.atkCoolTimeGauge.script.dynamicGaugeElement.setGauge(ratio);

    if (ratio <= 0.001) {
        this.remainAtkCooltime = 0;
        this.atkCoolTimeGauge.enabled = false;
        this.canAttack = true;
    }
};

MyPlayerComponent.prototype.onEntityInitialized = function (entityStaticData) {
    const screen = uiManager.showScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.init(gameManager.myname);

    const statComponent = this.entity.script.entityStatComponent;
    if (statComponent) {
        this.atkCooltime = statComponent.getValue(AlkkagiSharedBundle.StatConfig.Type.ATK_COOLTIME);
    }

    // 초기화 시점에 카메라 등록 시도
    this.tryRegisterCamera(entityStaticData);
};

MyPlayerComponent.prototype.onEntityUpdated = function (elapsedMS, prevEntityDynamicData, entityDynamicData) {
    const screen = uiManager.getScreen('ingame');
    if (screen == null)
        return;
    
    this.score = entityDynamicData.score;
    screen.script.inGameScreen.handlePlayerUpdate();

    // 업데이트 중에도 카메라 미등록 상태면 재시도
    if (!this._cameraRegistered) {
        const entityStaticData = this.entity.script.entityComponent?.entityStaticData;
        this.tryRegisterCamera(entityStaticData);
    }
};

MyPlayerComponent.prototype.onDie = function (killerEntity) {
    const resultScreen = uiManager.showScreen('result');

    resultScreen.script.resultScreen.show(killerEntity, {
        score: this.score, level: this.level
    });
};

MyPlayerComponent.prototype.handleLevelUp = function (level, levelUpPoint) {
    const screen = uiManager.getScreen('ingame');
    if (!screen)
        return;

    this.level = level;
    screen.script.inGameScreen.setLevel(level);
    screen.script.inGameScreen.handleUpdatePlayerLevelUpPoint(levelUpPoint);

    const soundComponent = this.entity.script.entitySoundComponent;
    soundComponent?.playSound('levelup');
};

MyPlayerComponent.prototype.handleStatLevelUp = function (type, level, remainLevelUpPoint) {
    const statComponent = this.entity.script.entityStatComponent;
    if (!statComponent)
        return;

    statComponent.handleStatLevelUp(type, level);
    if (type == AlkkagiSharedBundle.EStatLevelUpType.REDUCE_ATK_COOLTIME) {
        this.atkCooltime = statComponent.getValue(AlkkagiSharedBundle.StatConfig.Type.ATK_COOLTIME);
    }

    const screen = uiManager.getScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.statLevelUpPanel.script.statLevelUI.handleLevelUpResponse(type, level);
    screen.script.inGameScreen.handleUpdatePlayerLevelUpPoint(remainLevelUpPoint);
};

MyPlayerComponent.prototype.handleChargingStart = function () {
    if (this.canAttack == false)
        return;

    this.charging = true;
    this.chargingTime = 0;
    this.atkDirGroup.enabled = true;
};

MyPlayerComponent.prototype.handleChargingUpdate = function (dir) {
    const rad = Math.atan2(dir.y, dir.x);
    const deg = rad * 180 / Math.PI - 90;
    this.atkDirGroup.setLocalEulerAngles(0, 0, deg);
    const chargingPer = Math.min(1, this.chargingTime / 3);
    this.atkChagingInner.setLocalScale(chargingPer, chargingPer, 1);
};

MyPlayerComponent.prototype.handleChargingEnd = function () {
    if (this.charging == false)
        return;

    this.charging = false;
    this.atkDirGroup.enabled = false;

    if (this.chargingTime <= 0.5)
        return;

    this.canAttack = false;
    this.remainAtkCooltime = this.atkCooltime + 0.2;
    console.log('remainAtkCooltime', this.remainAtkCooltime);
    this.atkCoolTimeGauge.enabled = true;
    this.atkCoolTimeGauge.script.dynamicGaugeElement.setGauge(1);
};

MyPlayerComponent.prototype.onEntityDestroyed = function () {
    if (!this.isMyPlayer) {
        return;
    }

    const cameraManager = window.cameraManager;
    if (!cameraManager) {
        return;
    }

    if (cameraManager.target === this.entity) {
        this.tryRemoveCamera();
    }
};

MyPlayerComponent.prototype.tryRegisterCamera = function (entityStaticData) {
    if (this._cameraRegistered) return;
    if (!entityStaticData) return;

    const gm = window.gameManager;
    const cm = window.cameraManager;
    if (!gm || !cm) return;

    if (entityStaticData.entityID === gm.playerEntityID) {
        this.isMyPlayer = true;
        cm.setTarget(this.entity);
        cm.startFollowing();
        this._cameraRegistered = true;
    }
};
MyPlayerComponent.prototype.tryRemoveCamera = function () {
    if (!this._cameraRegistered) return;

    const cm = window.cameraManager;
    if (!cm) return;

    // 현재 추적 중인 대상이 이 엔티티인 경우에만 해제
    if (cm.target === this.entity) {
        cm.stopFollowing();
        cm.setTarget(null);
        this._cameraRegistered = false;
    }
};
