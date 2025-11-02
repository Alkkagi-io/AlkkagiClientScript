const MyPlayerComponent = pc.createScript('myPlayerComponent');

MyPlayerComponent.prototype.initialize = function() {
    this.atkDirGroup = this.entity.findByName('AtkDirGroup');
    this.atkChagingInner = this.entity.findByName('InnerArrow');
    this.atkCoolTimeGauge = this.entity.findByName('AtkCooltimeGauge');
    this.atkCoolTimeGauge.script.dynamicGaugeElement.maxValue = 1;
    this.score = 0;
    this.level = 1;
    this.isMyPlayer = false;
    this._cameraRegistered = false;

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);

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

MyPlayerComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const screen = uiManager.showScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.init(gameManager.myname);

    // 초기화 시점에 카메라 등록 시도
    this.tryRegisterCamera(entityStaticData);
};

MyPlayerComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    this.score = entityDynamicData.score;
    screen.script.inGameScreen.handlePlayerUpdate();

    const remainCooltimePer = entityDynamicData.remainAtkCoolPer / 100;
    this.atkCoolTimeGauge.enabled = remainCooltimePer > 0;
    this.atkCoolTimeGauge.script.dynamicGaugeElement.setGauge(remainCooltimePer);
    
    const chargingPer = entityDynamicData.chargingPer / 100;
    this.atkChagingInner.setLocalScale(chargingPer, chargingPer, 1);

    // 업데이트 중에도 카메라 미등록 상태면 재시도
    if (!this._cameraRegistered) {
        const entityStaticData = this.entity.script.entityComponent?.entityStaticData;
        this.tryRegisterCamera(entityStaticData);
    }
};

MyPlayerComponent.prototype.onDie = function(killerEntity) {
    const resultScreen = uiManager.showScreen('result');
    resultScreen.script.resultScreen.show(killerEntity, {
        score: this.score, level: this.level
    });
};

MyPlayerComponent.prototype.handleLevelUp = function(level, levelUpPoint) {
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    this.level = level;
    screen.script.inGameScreen.setLevel(level);
    screen.script.inGameScreen.handleUpdatePlayerLevelUpPoint(levelUpPoint);

    const soundComponent = this.entity.script.entitySoundComponent;
    soundComponent?.playSound('levelup');
};

MyPlayerComponent.prototype.handleStatLevelUp = function(type, level, remainLevelUpPoint) {
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    screen.script.inGameScreen.statLevelUpPanel.script.statLevelUI.handleLevelUpResponse(type, level);
    screen.script.inGameScreen.handleUpdatePlayerLevelUpPoint(remainLevelUpPoint);
};

MyPlayerComponent.prototype.handleChargingStart = function() {
    this.atkDirGroup.enabled = true;
};

MyPlayerComponent.prototype.handleChargingUpdate = function(dir) {
    const rad = Math.atan2(dir.y, dir.x);
    const deg = rad * 180 / Math.PI - 90;
    this.atkDirGroup.setLocalEulerAngles(0, 0, deg);
};

MyPlayerComponent.prototype.handleChargingEnd = function() {
    this.atkDirGroup.enabled = false;
};

MyPlayerComponent.prototype.onEntityDestroyed = function() {
    if (!this.isMyPlayer) {
        return;
    }

    const cameraManager = window.cameraManager;
    if (!cameraManager) {
        return;
    }

    if (cameraManager.target === this.entity) {
        cameraManager.setTarget(null);
    }
};

MyPlayerComponent.prototype.tryRegisterCamera = function(entityStaticData) {
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
