const MyPlayerComponent = pc.createScript('myPlayerComponent');

MyPlayerComponent.prototype.initialize = function() {
    this.atkDirGroup = this.entity.findByName('AtkDirGroup');
    this.atkChagingInner = this.entity.findByName('InnerArrow');
    this.atkCoolTimeGauge = this.entity.findByName('AtkCooltimeGauge');
    this.atkCoolTimeGauge.script.dynamicGaugeElement.maxValue = 1;

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);
}

MyPlayerComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const screen = uiManager.getScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.init(gameManager.myname);
};

MyPlayerComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    screen.script.inGameScreen.handlePlayerUpdate();

    const remainCooltimePer = entityDynamicData.remainAtkCoolPer / 100;
    this.atkCoolTimeGauge.enabled = remainCooltimePer > 0;
    this.atkCoolTimeGauge.script.dynamicGaugeElement.setGauge(remainCooltimePer);
    
    const chargingPer = entityDynamicData.chargingPer / 100;
    this.atkChagingInner.setLocalScale(chargingPer, chargingPer, 1);
};

MyPlayerComponent.prototype.handleLevelUp = function(level, levelUpPoint) {
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    screen.script.inGameScreen.setLevel(level);
    screen.script.inGameScreen.handleUpdatePlayerLevelUpPoint(levelUpPoint);
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