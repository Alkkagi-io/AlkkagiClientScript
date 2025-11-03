const XPObjectEntityComponent = pc.createScript('xpObjectEntityComponent');

XPObjectEntityComponent.attributes.add('innerImage', {
    type: 'entity'
});

XPObjectEntityComponent.attributes.add('outlineImage', {
    type: 'entity'
});

XPObjectEntityComponent.attributes.add('innerColorList', {
    type: 'rgb',
    array: true
});

XPObjectEntityComponent.attributes.add('outlineColorList', {
    type: 'rgb',
    array: true
});

XPObjectEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
};

XPObjectEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
};