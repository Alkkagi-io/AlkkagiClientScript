var InGameScreen = pc.createScript('InGameScreen');

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

InGameScreen.prototype.init = function(name) {
    this.nameText.element.text = name;
    this.setLevel(1);
    this.statLevelUpPanel.init();
    this.rankingPanel.updateMyScore(0);
}

InGameScreen.prototype.handlePlayerUpdate = function() {
    const playerEntityData = window.GameManager.getEntity(window.GameManager.playerEntityID).entityData;

    setLevel(playerEntityData.level);
    rankingPanel.updateMyScore(playerEntityData.score);
}

InGameScreen.prototype.setLevel = function(level) {
    const res = window.AlkkagiSharedBundle.ResourceCharacterLevel.get(level);
    if (res) {
        this.levelGauge.maxValue = res.requiredXP;
        this.levelGauge.script.gaugeElement.setGauge(0);
        this.levelGauge.script.gaugeElement.setText(`Level ${res.level}`);
    }
}