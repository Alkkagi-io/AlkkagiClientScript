const MyPlayerComponent = pc.createScript('myPlayerComponent');

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
    const screen = uiManager.getScreen('ingame');
    if (!screen) 
        return;

    screen.script.inGameScreen.handlePlayerUpdate();
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