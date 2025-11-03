const EntityMoveComponent = pc.createScript('entityMoveComponent');

const MOVE_THRESHOLD = 1;

EntityMoveComponent.prototype.initialize = function() {
    this._velocity = new pc.Vec3();

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);
};

EntityMoveComponent.prototype.update = function(dt) {
    this.entity.translate(this._velocity.x * dt, this._velocity.y * dt, this._velocity.z * dt);
};

EntityMoveComponent.prototype.onEntityInitialized = function(entityStaticData) {
    this._velocity.set(0, 0, 0);
    this.entity.setPosition(this._to3D(entityStaticData.position));
};

EntityMoveComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    const prevTargetPosition = prevEntityDynamicData == null ? this.entity.getPosition() : this._to3D(prevEntityDynamicData.position);
    const currentTargetPosition = this._to3D(entityDynamicData.position);

    if(prevTargetPosition.distance(this.entity.getPosition()) > MOVE_THRESHOLD) {
        this.entity.setPosition(prevTargetPosition);
    }

    const dt = Math.max(elapsedMS * 0.001, 1e-6);
    const currentPosition = this.entity.getPosition();
    this._velocity.sub2(currentTargetPosition, currentPosition).scale(1 / dt);
};

EntityMoveComponent.prototype._to3D = function (p2) {
    return new pc.Vec3(p2.x, p2.y, 0);
};

EntityMoveComponent.prototype.getVelocity = function() {
    return this._velocity;
}
