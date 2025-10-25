const EntityComponent = pc.createScript('entityComponent');

const MOVE_THRESHOLD = 0.05;

EntityComponent.prototype.initialize = function() {
    this.entityData = null;
    this._velocity = new pc.Vec3();
};

EntityComponent.prototype.initializeEntity = function(entityData) {
    this.entityData = entityData;
    this._velocity.set(0, 0, 0);
    this.entity.setPosition(this._to3D(this.entityData.position));
};

EntityComponent.prototype.updateEntityData = function(elapsedMS, entityData) {
    const prevTargetPosition = this._to3D(this.entityData.position);
    this.entityData = entityData;
    const currentTargetPosition = this._to3D(entityData.position);

    if(prevTargetPosition.distance(this.entity.getPosition()) > MOVE_THRESHOLD) {
        this.entity.setPosition(prevTargetPosition);
    }

    const dt = Math.max(elapsedMS * 0.001, 1e-6);
    const currentPosition = this.entity.getPosition();
    this._velocity.sub2(currentTargetPosition, currentPosition).scale(1 / dt);
};

EntityComponent.prototype.update = function(dt) {
    this.entity.translate(this._velocity.x * dt, this._velocity.y * dt, this._velocity.z * dt);
};

EntityComponent.prototype._to3D = function (p2) {
    return new pc.Vec3(p2.x, 0, -p2.y);
};
