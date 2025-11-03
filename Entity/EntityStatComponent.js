var EntityStatComponent = pc.createScript('entityStatComponent');

EntityStatComponent.prototype.initialize = function() {
    this.levels = [];
};

EntityStatComponent.prototype.getValue = function(type) {
    let value = 0;

    const defaultValue = AlkkagiSharedBundle.StatConfig.DefaultValue[type];
    if (defaultValue < 0)
        return 0;

    value = defaultValue;

    // 레벨업 수치 합산
    const res = AlkkagiSharedBundle.ResourceStatLevelUp.getByStatType(type);
    if(res == null){
        console.log('res is null');
        return 0;
    }

    const levelUpValue = res.getLevelValue(this.levels[res.id]);
    if(levelUpValue == null)
        return 0;

    if (res.isPercentage) {
        value += value * (levelUpValue.value / 100);
    } else {
        value += levelUpValue.value;
    }

    // 버프 들어오면 구현

    return value;
};

EntityStatComponent.prototype.handleStatLevelUp = function(type, level) {
    this.levels[type] = level;
}