var StatLevelElementUI = pc.createScript('statLevelElementUI');

StatLevelElementUI.attributes.add('statID', {
    type: 'string',
    enum: Object.entries(globalThis.bundle.EStatLevelUpType).map(([key, val]) => ({
        [key]: String(val)
    }))
    // enum: [
    //     { 'ADD_WEIGHT_PER': '1' },
    //     { 'ADD_MAX_CHARGE_LEN_PER': '2' },
    //     { 'ADD_MAX_HP_PER': '3' },
    //     { 'ADD_MOVE_SPEED_PER': '4' },
    //     { 'REDUCE_ATK_COOLTIME_PER': '5' },
    //     { 'AUTO_HEAL': '6' }
    // ]
});

StatLevelElementUI.prototype.postInitialize = function() {
    this.initializeUI();
};

StatLevelElementUI.prototype.initializeUI = async function() {
    
    console.log(`[StatLevelElementUI::initializeUI] ${this.statID}`);
    const resourceStatLevelUp = globalThis.bundle.ResourceStatLevelUp.get(this.statID);
    console.log(`[StatLevelElementUI::initializeUI] ${resourceStatLevelUp.name}`);
};