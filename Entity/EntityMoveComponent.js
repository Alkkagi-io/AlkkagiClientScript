const EntityMoveComponent = pc.createScript('entityMoveComponent');

const MOVE_THRESHOLD = 5;
// const JITTER_WEIGHT = 1;
// const JITTER_ALLOWANCE_MS = 200;
const MIN_DT = 0.01;
const MAX_DT = 0.3;
const VELOCITY_BLEND = 0.4;
// const POSITION_CORRECTION_STRENGTH = 0.3;

EntityMoveComponent.prototype.initialize = function() {
    this.lastReceivedTime = 0;
    // this.prevElapsedErrorMS = 0;
    this._velocity = new pc.Vec3();
    this._targetVelocity = new pc.Vec3();
    this._prevTargetPositionBuffer = new pc.Vec3();
    this._currentTargetPositionBuffer = new pc.Vec3();

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);
};

EntityMoveComponent.prototype.update = function(dt) {
    this._velocity.lerp(this._velocity, this._targetVelocity, VELOCITY_BLEND);

    // 위치 오차 보정 (아주 살짝)
    const pos = this.entity.getPosition();
    const err = this._currentTargetPositionBuffer;
    const POS_GAIN = 0.15; // 너무 크면 다시 부들거림

    // errVec = (서버가 마지막으로 준 위치 - 지금 내 위치)
    const errX = err.x - pos.x;
    const errY = err.y - pos.y;
    const errZ = err.z - pos.z;

    // 보정은 속도에 얹어주기
    this.entity.translate(
        (this._velocity.x + errX * POS_GAIN) * dt,
        (this._velocity.y + errY * POS_GAIN) * dt,
        (this._velocity.z + errZ * POS_GAIN) * dt
    );

    // this.entity.translate(this._velocity.x * dt, this._velocity.y * dt, this._velocity.z * dt);
};

EntityMoveComponent.prototype.onEntityInitialized = function(entityStaticData) {
    this._velocity.set(0, 0, 0);
    this._targetVelocity.set(0, 0, 0);
    this.lastReceivedTime = Date.now();
    this._to3D(entityStaticData.position, this._prevTargetPositionBuffer);
    this._to3D(entityStaticData.position, this._currentTargetPositionBuffer);
    this.entity.setPosition(this._prevTargetPositionBuffer);
};

EntityMoveComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    const currentPosition = this.entity.getPosition();
    const currentTime = Date.now();

    // const rawElapsedErrorMS = elapsedMS - (currentTime - this.lastReceivedTime);
    // const clampedElapsedErrorMS = Math.max(Math.min(rawElapsedErrorMS, JITTER_ALLOWANCE_MS), -JITTER_ALLOWANCE_MS);
    // const elapsedErrorMS = this.prevElapsedErrorMS * (1 - JITTER_WEIGHT) + clampedElapsedErrorMS * JITTER_WEIGHT;

    const elapsedErrorMS = elapsedMS - (currentTime - this.lastReceivedTime);
    // this.prevElapsedErrorMS = elapsedErrorMS;
    
    this.lastReceivedTime = currentTime;

    const prevTargetPosition = prevEntityDynamicData == null ? currentPosition : this._to3D(prevEntityDynamicData.position, this._prevTargetPositionBuffer);
    const currentTargetPosition = this._to3D(entityDynamicData.position, this._currentTargetPositionBuffer);

    if(prevTargetPosition.distance(currentPosition) > MOVE_THRESHOLD) {
        // currentPosition.lerp(currentPosition, prevTargetPosition, POSITION_CORRECTION_STRENGTH);
        this.entity.setPosition(prevTargetPosition);
        this._velocity.set(0, 0, 0);
        this._targetVelocity.set(0, 0, 0);
        return;
    }

    const dt = Math.max(Math.min((elapsedMS + elapsedErrorMS) * 0.001, MAX_DT), MIN_DT);
    // const dt = (elapsedMS + elapsedErrorMS) * 0.001;
    this._targetVelocity.sub2(currentTargetPosition, prevTargetPosition).scale(1 / dt);
    // this._velocity.sub2(currentTargetPosition, this.entity.getPosition()).scale(1 / dt);
};

EntityMoveComponent.prototype._to3D = function (p2, out) {
    out.set(p2.x, p2.y, 0);
    return out;
};

EntityMoveComponent.prototype.getVelocity = function() {
    return this._velocity;
}
