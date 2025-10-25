var InputManager = pc.createScript('inputManager');

// Initialize
InputManager.prototype.initialize = function () {
    // 입력 상태
    this.lastInput = null;
    this._lastBlockReason = null;

    // 공격 상태
    this.isCharging = false;

    // 마지막 비영(0,0) 이동 방향 (공격 에임 대체용)
    this._lastNonZeroDir = new pc.Vec2(1, 0);

    this._mousePos = new pc.Vec2();
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, function (ev) {
        this._mousePos.set(ev.x, ev.y);
    }, this);


    console.log('[InputManager] Initialized');
};

// Update loop
InputManager.prototype.update = function (dt) {
    // 2) 플레이어 준비 플래그
    if (gameManager.playerEntityID == -1) {
        return;
    }

    // 블록 해제
    this._lastBlockReason = null;

    // ===== 이동 입력 처리 =====
    var input = this._getMoveInput();
    if (input !== this.lastInput) {
        this.lastInput = input;

        // 마지막 비영 방향 갱신
        var v = this._inputToVec2(input);
        if (v.x !== 0 || v.y !== 0) {
            this._lastNonZeroDir.copy(v);
        }

        // 패킷 전송
        gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_MoveInputPacket(input));

        // 디버그 로그 (필요시)
        // var inputNames = ['None','Up','Down','Left','Right','UpLeft','UpRight','DownLeft','DownRight'];
        // console.log('[InputManager] Movement:', inputNames[input] || 'Unknown');
    }

    // ===== 공격 입력 처리 =====
    var mousePressed = this.app.mouse && this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT);
    var spacePressed = this.app.keyboard && this.app.keyboard.isPressed(pc.KEY_SPACE);
    var attackPressed = mousePressed || spacePressed;

    if (attackPressed && !this.isCharging) {
        // 공격 시작
        gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_StartAttackChargingPacket());
        this.isCharging = true;
        console.log('[InputManager] Start Attack');
    } else if (!attackPressed && this.isCharging) {
        // 공격 종료
        var dir = this._getAimDirection2D();
        if (dir.length() === 0) {
            dir.copy(this._lastNonZeroDir);
        }
        if (dir.length() === 0) {
            dir.set(1, 0);
        }
        dir.normalize();

        var pkt = new AlkkagiSharedBundle.C2S_FinishAttackChargingPacket(new AlkkagiSharedBundle.Vector(dir.x, -dir.y));
        gameManager.networkManager.send(pkt);
        this.isCharging = false;
        console.log(`[InputManager] Finish Attack ${dir}`);
    }
};

// 이동 입력 계산
InputManager.prototype._getMoveInput = function () {
    if (!this.app.keyboard) return AlkkagiSharedBundle.EMoveInput.None;

    var kb = this.app.keyboard;
    var up = kb.isPressed(pc.KEY_W) || kb.isPressed(pc.KEY_UP);
    var down = kb.isPressed(pc.KEY_S) || kb.isPressed(pc.KEY_DOWN);
    var left = kb.isPressed(pc.KEY_A) || kb.isPressed(pc.KEY_LEFT);
    var right = kb.isPressed(pc.KEY_D) || kb.isPressed(pc.KEY_RIGHT);

    if (up && left) return AlkkagiSharedBundle.EMoveInput.UpLeft;
    if (up && right) return AlkkagiSharedBundle.EMoveInput.UpRight;
    if (down && left) return AlkkagiSharedBundle.EMoveInput.DownLeft;
    if (down && right) return AlkkagiSharedBundle.EMoveInput.DownRight;
    if (up) return AlkkagiSharedBundle.EMoveInput.Up;
    if (down) return AlkkagiSharedBundle.EMoveInput.Down;
    if (left) return AlkkagiSharedBundle.EMoveInput.Left;
    if (right) return AlkkagiSharedBundle.EMoveInput.Right;
    return AlkkagiSharedBundle.EMoveInput.None;
};

// EMoveInput -> 2D 방향 벡터
InputManager.prototype._inputToVec2 = function (input) {
    switch (input) {
        case AlkkagiSharedBundle.EMoveInput.Up: return new pc.Vec2(0, 1);
        case AlkkagiSharedBundle.EMoveInput.Down: return new pc.Vec2(0, -1);
        case AlkkagiSharedBundle.EMoveInput.Left: return new pc.Vec2(-1, 0);
        case AlkkagiSharedBundle.EMoveInput.Right: return new pc.Vec2(1, 0);
        case AlkkagiSharedBundle.EMoveInput.UpLeft: return new pc.Vec2(-1, 1);
        case AlkkagiSharedBundle.EMoveInput.UpRight: return new pc.Vec2(1, 1);
        case AlkkagiSharedBundle.EMoveInput.DownLeft: return new pc.Vec2(-1, -1);
        case AlkkagiSharedBundle.EMoveInput.DownRight: return new pc.Vec2(1, -1);
        default: return new pc.Vec2(0, 0);
    }
};

// 마우스 에임 방향 계산 (2D, XZ 평면)
InputManager.prototype._getAimDirection2D = function () {
    try {
        if (gameManager.playerEntityID == -1) {
            return new pc.Vec2(0, 0);
        }

        var player = gameManager.getEntity(gameManager.playerEntityID);
        if (player == null) {
            return new pc.Vec2(0, 0);
        }

        // 카메라 찾기
        var camEntity = this.app.root.findByTag('main-camera');
        if (!camEntity || camEntity.length === 0) {
            camEntity = this.app.root.findByName('Camera');
            if (!camEntity) {
                return new pc.Vec2(0, 0);
            }
        } else {
            camEntity = camEntity[0];
        }

        if (!camEntity.camera) {
            return new pc.Vec2(0, 0);
        }

        var cam = camEntity.camera;
        // 레이 생성
        var from = cam.screenToWorld(this._mousePos.x, this._mousePos.y, cam.nearClip);
        var to = cam.screenToWorld(this._mousePos.x, this._mousePos.y, cam.farClip);
        var dir3 = new pc.Vec3();
        dir3.sub2(to, from).normalize();

        // y=0 평면과 교차
        if (Math.abs(dir3.y) < 1e-6) {
            return new pc.Vec2(0, 0);
        }

        var t = -from.y / dir3.y;
        if (t <= 0) {
            return new pc.Vec2(0, 0);
        }

        var hit = new pc.Vec3();
        hit.copy(dir3).mulScalar(t).add(from);

        var playerPos = player.getPosition();
        
        // 2D 방향 (x, z)
        return new pc.Vec2(hit.x - playerPos.x, hit.z - playerPos.z);
    } catch (e) {
        console.error('[InputManager] Error in _getAimDirection2D:', e);
        return new pc.Vec2(0, 0);
    }
};

// 블록 로그 (중복 방지)
InputManager.prototype._logBlock = function (reason) {
    if (this._lastBlockReason !== reason) {
        console.warn('[InputManager][Block]', reason);
        this._lastBlockReason = reason;
    }
};

// 디버그: 현재 입력 이름
InputManager.prototype.getCurrentInputName = function () {
    var inputNames = ['None','Up','Down','Left','Right','UpLeft','UpRight','DownLeft','DownRight'];
    return inputNames[this.lastInput] || 'Unknown';
};

// 디버그: 수동 입력 전송
InputManager.prototype.sendInput = function (inputValue) {
    gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_MoveInputPacket(inputValue));
    console.log('[InputManager] Manual input sent:', inputValue);
};