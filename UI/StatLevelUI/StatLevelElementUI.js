var StatLevelElementUI = pc.createScript('statLevelElementUI');

StatLevelElementUI.attributes.add('statId', {
    type: 'number'
});

StatLevelElementUI.attributes.add('gauge', {
    type: 'entity'
});

StatLevelElementUI.attributes.add('button', {
    type: 'entity'
});

StatLevelElementUI.attributes.add('level', {
    type: 'number'
});

StatLevelElementUI.prototype.init = function(statId) {
    this.statId = statId;  
    this.button.button.off('click');
    this.button.button.on('click', event => {
        this.onClickUpgrade();
        uiManager.playUISound('default_button_click');
    });

    const res = AlkkagiSharedBundle.ResourceStatLevelUp.get(this.statId);
    if (!res)
        return;

    this.gauge.script.GaugeElement.maxValue = res.maxLevel;

    this.reload(0);
};

StatLevelElementUI.prototype.reload = function(curLevel) {
    if (this.level == curLevel)
        return;
    this.level = curLevel;

    const res = AlkkagiSharedBundle.ResourceStatLevelUp.get(this.statId);
    if (!res)
        return;

    this.gauge.script.GaugeElement.setGauge(curLevel);
};

StatLevelElementUI.prototype.onClickUpgrade = function() {
    gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_CharacterStatLevelUpRequestPacket(this.statId));
};