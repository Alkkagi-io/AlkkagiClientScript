const MyPlayerComponent = pc.createScript('myPlayerComponent');

MyPlayerComponent.prototype.initialize = function() {
    this.atkDirGroup = this.entity.findByName('AtkDirGroup');
    this.atkChagingInner = this.entity.findByName('InnerArrow');
    this.atkCoolTimeGauge = this.entity.findByName('AtkCooltimeGauge');
    this.atkCoolTimeGauge.script.dynamicGaugeElement.maxValue = 1;
    this.score = 0;
    this.level = 1;

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);

    const characterEntityComponent = this.entity.script.characterEntityComponent;
    characterEntityComponent.getEvents().on('onDie', this.onDie, this);
}

MyPlayerComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const screen = uiManager.showScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.init(gameManager.myname);
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