const EntityComponent = pc.createScript('entityComponent');

EntityComponent.prototype.initialize = function() {
    this.entityData = null;
    this._targetPos = new pc.Vec3();
    this._velocity = new pc.Vec3();
    this._hasVelocity = false;
    this._snapThreshold = 0.05;
};

EntityComponent.prototype.initializeEntity = function(entityData) {
    this.entityData = entityData;
    this._targetPos.copy(this._to3D(this.entityData.position));
    this._velocity.set(0, 0, 0);
    this._hasVelocity = false;

    this.entity.setPosition(this._targetPos);
};

EntityComponent.prototype.updateEntityData = function(elapsedMS, entityData) {
    // 이전/현재 2D
    const prevPosition = this.entityData ? this.entityData.position : entityData.position;
    const currentPosition = entityData.position;

    this.entityData = entityData;
    this._targetPos.copy(this._to3D(currentPosition));

    // 경과 시간 방어
    if (!elapsedMS || elapsedMS <= 0) {
        // 시간 정보가 없으면 위치만 스냅하고 속도는 0
        this._velocity.set(0, 0, 0);
        this._hasVelocity = false;
        this.entity.setPosition(this._targetPos);
        return;
    }

    // 2D 델타 → 3D 속도(m/s)
    const dx = (currentPosition.x - prevPosition.x);
    const dy = (currentPosition.y - prevPosition.y); // 2D y를 3D z로 매핑
    const seconds = elapsedMS / 1000;

    // 속도 = 거리 / 시간
    this._velocity.set(dx / seconds, 0, dy / seconds);
    this._hasVelocity = true;

    // 선택: 원격 보정. 현재 위치와 목표가 너무 벌어졌으면 한 번 맞춰두기
    const curPos = this.entity.getPosition();
    if (curPos.distance(this._targetPos) > 3.0) { // 원격 텔레포트/랙 대응
        this.entity.setPosition(this._targetPos);
    }
};

EntityComponent.prototype.update = function(dt) {
    if (!this.entityData) return;

    const pos = this.entity.getPosition();

    if (this._hasVelocity) {
        // v * dt 만큼 이동
        pos.x += this._velocity.x * dt;
        pos.z += this._velocity.z * dt;
        this.entity.setPosition(pos);
    }

    // 미세 보정: 목표와 아주 가까우면 스냅해서 오차 누적 방지
    const dist = pos.distance(this._targetPos);
    if (dist <= this._snapThreshold) {
        this.entity.setPosition(this._targetPos);
    }
};

EntityComponent.prototype._to3D = function (p2) {
    // 탑다운: y -> z. 필요하면 y축 높이를 바꾸세요.
    return new pc.Vec3(p2.x, 0, p2.y);
};