const StaticEntityComponent = pc.createScript('staticEntityComponent');

StaticEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
}

StaticEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const position = new pc.Vec3(entityStaticData.position.x, entityStaticData.position.y, 0);
    this.entity.setPosition(position);
}