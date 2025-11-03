const XPContainerEntityComponent = pc.createScript('xpContainerEntityComponent');

XPContainerEntityComponent.attributes.add('innerImageName', {
    type: 'string'
});

XPContainerEntityComponent.attributes.add('outlineImageName', {
    type: 'string'
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
    this.innerImage = this.entity.findByName(this.innerImageName);
    this.outlineImage = this.entity.findByName(this.outlineImageName);
    
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    
    const angle = Math.random() * 360;
    this.outlineImage.setLocalEulerAngles(0, 0, angle);
};

XPContainerEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const STEP = 3;
    const index = Math.min(Math.floor(entityStaticData.xpUnit / STEP), this.innerColorList.length - 1);

    const innerColor = this.innerColorList[index];
    this.innerImage.sprite.color = innerColor;
    this.innerImage.sprite.opacity = 1;

    const outlineColor = this.outlineColorList[index];
    this.outlineImage.sprite.color = outlineColor;
    this.outlineImage.sprite.opacity = 1;
};