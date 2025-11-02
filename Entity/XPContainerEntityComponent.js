const XPContainerEntityComponent = pc.createScript('xpContainerEntityComponent');

XPContainerEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
};

XPContainerEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    console.log(`XPContainerEntityComponent: onEntityInitialized, xpUnit: ${entityStaticData.xpUnit}`);
};