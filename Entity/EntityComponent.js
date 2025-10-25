const EntityComponent = pc.createScript('entityComponent');

EntityComponent.prototype.initialize = function() {
    this.entityData = null;
    this._targetPos = new pc.Vec3();
    this._prevPos = new pc.Vec3();
    this._interpElapsed = 0;
    this._interpDuration = 0;
    this._snapThreshold = 0.05;
    this._teleportThreshold = 3.0;
};

EntityComponent.prototype.initializeEntity = function(entityData) {
    this.entityData = entityData;
    this._targetPos.copy(this._to3D(this.entityData.position));
    this._prevPos.copy(this._targetPos);
    this._interpElapsed = 0;
    this._interpDuration = 0;

    this.entity.setPosition(this._targetPos);
};

EntityComponent.prototype.updateEntityData = function(elapsedMS, entityData) {
    const currentPosition = entityData.position;
    const hadSnapshot = !!this.entityData;

    this.entityData = entityData;
    this._targetPos.copy(this._to3D(currentPosition));

    // 최초 스냅 혹은 경과 시간 없음
    if (!hadSnapshot || !elapsedMS || elapsedMS <= 0) {
        this._prevPos.copy(this._targetPos);
        this._interpElapsed = 0;
        this._interpDuration = 0;
        this.entity.setPosition(this._targetPos);
        return;
    }

    const curPos = this.entity.getPosition();

    // 원격 보정: 현재 위치와 목표가 너무 벌어졌으면 한 번 맞춰두기
    if (curPos.distance(this._targetPos) > this._teleportThreshold) {
        this._prevPos.copy(this._targetPos);
        this._interpElapsed = 0;
        this._interpDuration = 0;
        this.entity.setPosition(this._targetPos);
        return;
    }

    this._prevPos.copy(curPos);
    this._interpElapsed = 0;
    this._interpDuration = elapsedMS / 1000;
};

EntityComponent.prototype.update = function(dt) {
    if (!this.entityData) return;

    const pos = this.entity.getPosition();

    if (this._interpDuration > 0) {
        this._interpElapsed = Math.min(this._interpElapsed + dt, this._interpDuration);
        const alpha = this._interpDuration > 0 ? this._interpElapsed / this._interpDuration : 1;
        pos.lerp(this._prevPos, this._targetPos, alpha);
        this.entity.setPosition(pos);

        if (this._interpElapsed >= this._interpDuration) {
            this._interpDuration = 0;
            this.entity.setPosition(this._targetPos);
        }
    } else {
        const dist = pos.distance(this._targetPos);
        // 미세 보정: 목표와 아주 가까우면 스냅해서 오차 누적 방지
        if (dist <= this._snapThreshold) {
            this.entity.setPosition(this._targetPos);
        }
    }
};

EntityComponent.prototype._to3D = function (p2) {
    // 탑다운: y -> -z (PlayCanvas는 오른손 좌표계 기준으로 전방이 -z)
    return new pc.Vec3(p2.x, 0, -p2.y);
};
