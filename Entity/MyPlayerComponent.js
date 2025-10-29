const MyPlayerComponent = pc.createScript('myPlayerComponent');

MyPlayerComponent.prototype.initialize = function() {
    this.atkDirGroup = this.entity.findByName('AtkDirGroup');
    this.atkChagingInner = this.entity.findByName('InnerArrow');
    this.atkCoolTimeGauge = this.entity.findByName('AtkCooltimeGauge');
    this.atkCoolTimeGauge.script.dynamicGaugeElement.maxValue = 1;
}

MyPlayerComponent.prototype.init = function() {
    const entityData = this.entity.script.entityComponent.entityData;
    if (!entityData)
        return;

    const screen = uiManager.getScreen('ingame');
    if (!screen)
        return;

    screen.script.inGameScreen.init(entityData.name);
};

MyPlayerComponent.prototype.handleUpdateEntityData = function() {
    const entityData = this.entity.script.entityComponent.entityData;
    if (!entityData)
        return;

    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    screen.script.inGameScreen.handlePlayerUpdate();

    const remainCooltimePer = entityData.remainAtkCoolPer / 100;
    this.atkCoolTimeGauge.enabled = remainCooltimePer > 0;
    this.atkCoolTimeGauge.script.dynamicGaugeElement.setGauge(remainCooltimePer);
    
    const chargingPer = entityData.chargingPer / 100;
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