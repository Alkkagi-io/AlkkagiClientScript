var DamagableEntityComponent = pc.createScript('damagableEntityComponent');

DamagableEntityComponent.attributes.add('hpGaugeEntityName', {
    type: 'string'
});

DamagableEntityComponent.prototype.initialize = function() {
    this.hpGauge = this.entity.findByName(this.hpGaugeEntityName);
    this.hpGauge.script.dynamicGaugeElement.maxValue = 1;

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);
}

DamagableEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    this.hpGauge.script.dynamicGaugeElement.setGauge(0);
}

DamagableEntityComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    this.hpGauge.script.dynamicGaugeElement.setGauge(entityDynamicData.hpPer / 100);
}