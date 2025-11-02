const XPObjectEntityComponent = pc.createScript('xpObjectEntityComponent');

XPObjectEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
};

XPObjectEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    console.log(`XPObjectEntityComponent: onEntityInitialized, xpAmount: ${entityStaticData.xpAmount}, lifeTime: ${entityStaticData.lifeTime}`);
};