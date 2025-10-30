const EntityComponent = pc.createScript('entityComponent');

EntityComponent.prototype.initialize = function() {
    this._velocity = new pc.Vec3();
};

EntityComponent.prototype.postInitialize = function() {
    this.initializeEntity(this.entityStaticData);
};

EntityComponent.prototype.getEvents = function() {
    this.events ??= new EventEmitter();
    return this.events;
};

EntityComponent.prototype.initializeEntity = function(entityStaticData) {
    this.entityStaticData = entityStaticData;
    this.getEvents().emit('entityInitialized', this.entityStaticData);
};

EntityComponent.prototype.updateEntity = function(elapsedMS, entityDynamicData) {
    const prevEntityDynamicData = this.entityDynamicData;
    this.entityDynamicData = entityDynamicData;
    this.getEvents().emit('entityUpdated', elapsedMS, prevEntityDynamicData, this.entityDynamicData);
};