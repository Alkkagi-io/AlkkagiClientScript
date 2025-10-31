const TestSimpleMove = pc.createScript('testSimpleMove');

TestSimpleMove.attributes.add('moveSpeed', {
    type: 'number',
    default: 5.0,
    title: 'Move Speed'
});

TestSimpleMove.prototype.initialize = function() {
    this._moveDir = new pc.Vec3();
    console.log('[TestSimpleMove] Initialized');
    this.entity.collision.on('triggerenter', this.onCollisionTriggerEnter, this);
    this.entity.collision.on('collisionstart', this.onCollisionCollisionStart, this);
    this.entity.rigidbody?.on('triggerenter', this.onRigidbodyTriggerEnter, this);
    this.entity.rigidbody?.on('collisionstart', this.onRigidbodyCollisionStart, this);
};

TestSimpleMove.prototype.update = function(dt) {
    if (!this.app.keyboard) return;

    var kb = this.app.keyboard;
    var moveDir = new pc.Vec3();

    // WASD 입력 처리
    if (kb.isPressed(pc.KEY_W)) {
        moveDir.z -= 1; // 앞으로
    }
    if (kb.isPressed(pc.KEY_S)) {
        moveDir.z += 1; // 뒤로
    }
    if (kb.isPressed(pc.KEY_A)) {
        moveDir.x -= 1; // 왼쪽
    }
    if (kb.isPressed(pc.KEY_D)) {
        moveDir.x += 1; // 오른쪽
    }

    // 대각선 이동 시 정규화
    if (moveDir.length() > 0) {
        moveDir.normalize();
        
        // 속도 적용
        var deltaPos = moveDir.clone();
        deltaPos.scale(this.moveSpeed * dt);
        
        // 현재 위치에 더하기
        var currentPos = this.entity.getPosition();
        currentPos.add(deltaPos);
        this.entity.setPosition(currentPos);
    }
};

TestSimpleMove.prototype.onCollisionTriggerEnter = function(entity) {
    console.log(`[TestSimpleMove] Collision Trigger Enter. this: ${this.entity.name}, entity: ${entity.name}`);
};

TestSimpleMove.prototype.onCollisionCollisionStart = function(result) {
    console.log(`[TestSimpleMove] Collision Collision Start. this: ${this.entity.name}, entity: ${result.other.name}`);
};

TestSimpleMove.prototype.onRigidbodyTriggerEnter = function(entity) {
    console.log(`[TestSimpleMove] Rigidbody Trigger Enter. this: ${this.entity.name}, entity: ${entity.name}`);
};

TestSimpleMove.prototype.onRigidbodyCollisionStart = function(result) {
    console.log(`[TestSimpleMove] Rigidbody Collision Start. this: ${this.entity.name}, entity: ${result.other.name}`);
};