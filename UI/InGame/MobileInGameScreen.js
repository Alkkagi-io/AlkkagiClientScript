var MobileInGameScreen = pc.createScript('mobileInGameScreen');

MobileInGameScreen.attributes.add('nameText', {
    type: 'entity'
});

MobileInGameScreen.attributes.add('levelGauge', {
    type: 'entity'
});

MobileInGameScreen.attributes.add('statLevelUpPanel', {
    type: 'entity'
});

MobileInGameScreen.attributes.add('rankingPanel', {
    type: 'entity'
});

MobileInGameScreen.attributes.add('controlNotiPopup', {
    type: 'entity'
});

MobileInGameScreen.attributes.add('playTime', {
    type: 'number'
});

MobileInGameScreen.prototype.postInitialize = function() {
    uiManager.addScreen('ingame', this, true);
    this.entity.enabled = false;
}

MobileInGameScreen.prototype.init = function(name) {
    this.playTime += 1;
    this.nameText.element.text = name;
    this.setLevel(1);
    this.handleUpdatePlayerLevelUpPoint(0);
    this.statLevelUpPanel.script.statLevelUI.init();
    this.rankingPanel.script.RankingPanel.updateMyScore(0);

    this.controlNotiPopup.script.controlNotiPopup.show(true);
}

MobileInGameScreen.prototype.handlePlayerUpdate = function() {
    const entity = window.gameManager.getEntity(window.gameManager.playerEntityID);
    const entityDynamicData = entity.script.entityComponent.entityDynamicData;

    // this.setLevel(playerEntityData.level);
    this.rankingPanel.script.RankingPanel.updateMyScore(entityDynamicData.score);
    this.handlePlayerXPUpdate(entityDynamicData.exp);
}

MobileInGameScreen.prototype.handlePlayerXPUpdate = function(totalXP) {
    this.levelGauge.script.GaugeElement.setGauge(totalXP);
}

MobileInGameScreen.prototype.handleUpdatePlayerLevelUpPoint = function(levelUpPoint) {
    this.statLevelUpPanel.enabled = levelUpPoint > 0;
}

MobileInGameScreen.prototype.setLevel = function(level) {
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