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
    uiManager.addScreen('ingame', this.entity);
    this.entity.enabled = false;
}

InGameScreen.prototype.init = function(name) {
    this.nameText.element.text = name;
    this.setLevel(1);
    this.statLevelUpPanel.script.statLevelUI.init();
    this.rankingPanel.script.RankingPanel.updateMyScore(0);
}

InGameScreen.prototype.handlePlayerUpdate = function() {
    const entity = window.gameManager.getEntity(window.gameManager.playerEntityID);
    const entityDynamicData = entity.script.entityComponent.entityDynamicData;

    // this.setLevel(playerEntityData.level);
    this.rankingPanel.script.RankingPanel.updateMyScore(entityDynamicData.score);
    this.handlePlayerXPUpdate(entityDynamicData.exp);
}

InGameScreen.prototype.handlePlayerXPUpdate = function(totalXP) {
    this.levelGauge.script.GaugeElement.setGauge(totalXP);
}

InGameScreen.prototype.handleUpdatePlayerLevelUpPoint = function(levelUpPoint) {
    //todo: doyun
}

InGameScreen.prototype.setLevel = function(level) {
    const res = window.AlkkagiSharedBundle.ResourceCharacterLevel.get(level);
    if (res) {
        const prevRes = window.AlkkagiSharedBundle.ResourceCharacterLevel.get(level - 1);
        let offset = 0;
        if (prevRes) {
            offset = prevRes.requiredXP;
        }

        this.levelGauge.script.GaugeElement.maxValue = res.requiredXP - offset;
        this.levelGauge.script.GaugeElement.offset = offset;
        this.levelGauge.script.GaugeElement.setGauge(0);
        this.levelGauge.script.GaugeElement.setText(`Level ${res.level}`);
    }
}