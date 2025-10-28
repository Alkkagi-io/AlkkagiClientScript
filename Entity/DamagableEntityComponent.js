var DamagableEntityComponent = pc.createScript('damagableEntityComponent');

DamagableEntityComponent.attributes.add('hpGaugeEntityName', {
    type: 'string'
});

DamagableEntityComponent.prototype.initialize = function() {
    this.hpGauge = this.entity.findByName(this.hpGaugeEntityName);
    this.hpGauge.script.dynamicGaugeElement.maxValue = 1;
}

DamagableEntityComponent.prototype.handleChangeHp = function(hpPer) {
    this.hpGauge.script.dynamicGaugeElement.setGauge(hpPer / 100);
}