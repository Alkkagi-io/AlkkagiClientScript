var InGameScreen = pc.createScript('inGameScreen');

InGameScreen.attributes.add('nameText', {
    type: 'entity'
});

InGameScreen.attributes.add('levelGauge', {
    type: 'entity'
});

InGameScreen.attributes.add('statLevelUpPanel', {
    type: 'entity'
});

InGameScreen.attributes.add('rankingPanel', {
    type: 'entity'
});

InGameScreen.prototype.postInitialize = function() {
    uiManager.addScreen('ingame', this);
}

InGameScreen.prototype.init = function(name) {
    this.nameText.element.text = name;
    this.setLevel(1);
    this.statLevelUpPanel.init();
    this.rankingPanel.updateMyScore(0);
}

InGameScreen.prototype.handlePlayerUpdate = function() {
    const playerEntityData = window.gameManager.getEntity(window.gameManager.playerEntityID).entityData;

    setLevel(playerEntityData.level);
    rankingPanel.updateMyScore(playerEntityData.score);
    this.handlePlayerXPUpdate(playerEntityData.exp);
}

InGameScreen.prototype.handlePlayerXPUpdate = function(totalXP) {
    // todo: doyun
}

InGameScreen.prototype.handleUpdatePlayerLevelUpPoint = function(levelUpPoint) {
    //todo: doyun
}

InGameScreen.prototype.setLevel = function(level) {
    const res = window.AlkkagiSharedBundle.ResourceCharacterLevel.get(level);
    if (res) {
        this.levelGauge.maxValue = res.requiredXP;
        this.levelGauge.script.gaugeElement.setGauge(0);
        this.levelGauge.script.gaugeElement.setText(`Level ${res.level}`);
    }
}