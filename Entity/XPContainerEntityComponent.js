const XPContainerEntityComponent = pc.createScript('xpContainerEntityComponent');

XPContainerEntityComponent.attributes.add('innerImage', {
    type: 'entity'
});

XPContainerEntityComponent.attributes.add('outlineImage', {
    type: 'entity'
});

XPContainerEntityComponent.attributes.add('innerColorList', {
    type: 'rgb',
    array: true
});

XPContainerEntityComponent.attributes.add('outlineColorList', {
    type: 'rgb',
    array: true
});

XPContainerEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
};

XPContainerEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
};