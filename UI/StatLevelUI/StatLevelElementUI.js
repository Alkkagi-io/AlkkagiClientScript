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
    this.button.button.on('click', function(event) {
        this.onClickUpgrade();
    });

    this.reload(0);
};

StatLevelElementUI.prototype.reload = function(curLevel) {
    if (this.level == curLevel)
        return;
    this.level = curLevel;

    const res = window.AlkkagiSharedBundle.ResourceStatLevels.get(this.statId);
    if (!res)
        return;
    this.gauge().setValue(curLevel / res.maxLevel);
};

StatLevelElementUI.prototype.onClickUpgrade = function() {
    window.gameManager.networkManager.send(new window.AlkkagiSharedBundle.C2S_CharacterStatLevelUpRequestPacket(this.statId));
};