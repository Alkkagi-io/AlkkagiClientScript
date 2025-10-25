/* global pc */

var InputManager = pc.createScript('inputManager');

// Attributes
InputManager.attributes.add('networkEntity', { 
    type: 'entity', 
    title: 'Network Entity',
    description: 'Reference to the network entity (optional)'
});

// Initialize
InputManager.prototype.initialize = function () {
    // 입력 상태
    this.lastInput = null;
    this._lastBlockReason = null;

    // 공격 상태
    this.isCharging = false;

    // 마지막 비영(0,0) 이동 방향 (공격 에임 대체용)
    this._lastNonZeroDir = new pc.Vec2(1, 0);

    console.log('[InputManager] Initialized');
};

// Update loop
InputManager.prototype.update = function (dt) {
    // 1) SharedBundle 체크
    if (!window.AlkkagiSharedBundle) {
        this._logBlock('SharedBundle not loaded');
        return;
    }

    // 2) 플레이어 준비 플래그
    if (!window.setPlayerHandler) {
        return;
    }

    // 3) 네트워크 매니저
    var network = window.networkManager;
    if (!network) {
        this._logBlock('NetworkManager not found');
        return;
    }

    // 4) 웹소켓 상태
    if (!network.ws || network.ws.readyState !== WebSocket.OPEN) {
        this._logBlock('WebSocket not open');
        return;
    }

    // 블록 해제
    this._lastBlockReason = null;

    var B = window.AlkkagiSharedBundle;

    // ===== 이동 입력 처리 =====
    var input = this._getMoveInput(B);
    if (input !== this.lastInput) {
        this.lastInput = input;

        // 마지막 비영 방향 갱신
        var v = this._inputToVec2(input, B);
        if (v.x !== 0 || v.y !== 0) {
            this._lastNonZeroDir.copy(v);
        }

        // 패킷 전송
        network.send(new B.C2S_MoveInputPacket(input));

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
        network.send(new B.C2S_StartAttackChargingPacket());
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

        var pkt = new B.C2S_FinishAttackChargingPacket(new B.Vector(dir.x, dir.y));
        network.send(pkt);
        this.isCharging = false;
        console.log('[InputManager] Finish Attack', dir.x.toFixed(2), dir.y.toFixed(2));
    }
};

// 이동 입력 계산
InputManager.prototype._getMoveInput = function (B) {
    if (!this.app.keyboard) return B.EMoveInput.None;

    var kb = this.app.keyboard;
    var up = kb.isPressed(pc.KEY_W) || kb.isPressed(pc.KEY_UP);
    var down = kb.isPressed(pc.KEY_S) || kb.isPressed(pc.KEY_DOWN);
    var left = kb.isPressed(pc.KEY_A) || kb.isPressed(pc.KEY_LEFT);
    var right = kb.isPressed(pc.KEY_D) || kb.isPressed(pc.KEY_RIGHT);

    if (up && left) return B.EMoveInput.UpLeft;
    if (up && right) return B.EMoveInput.UpRight;
    if (down && left) return B.EMoveInput.DownLeft;
    if (down && right) return B.EMoveInput.DownRight;
    if (up) return B.EMoveInput.Up;
    if (down) return B.EMoveInput.Down;
    if (left) return B.EMoveInput.Left;
    if (right) return B.EMoveInput.Right;
    return B.EMoveInput.None;
};

// EMoveInput -> 2D 방향 벡터
InputManager.prototype._inputToVec2 = function (input, B) {
    switch (input) {
        case B.EMoveInput.Up: return new pc.Vec2(0, 1);
        case B.EMoveInput.Down: return new pc.Vec2(0, -1);
        case B.EMoveInput.Left: return new pc.Vec2(-1, 0);
        case B.EMoveInput.Right: return new pc.Vec2(1, 0);
        case B.EMoveInput.UpLeft: return new pc.Vec2(-1, 1);
        case B.EMoveInput.UpRight: return new pc.Vec2(1, 1);
        case B.EMoveInput.DownLeft: return new pc.Vec2(-1, -1);
        case B.EMoveInput.DownRight: return new pc.Vec2(1, -1);
        default: return new pc.Vec2(0, 0);
    }
};

// 마우스 에임 방향 계산 (2D, XZ 평면)
InputManager.prototype._getAimDirection2D = function () {
    try {
        var network = window.networkManager;
        if (!network || network.playerEntityId == null) {
            return new pc.Vec2(0, 0);
        }

        var player = network.getOrCreateEntity(network.playerEntityId);
        if (!player) {
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
        var mouse = this.app.mouse;
        if (!mouse) {
            return new pc.Vec2(0, 0);
        }

        // 레이 생성
        var from = cam.screenToWorld(mouse.x, mouse.y, cam.nearClip);
        var to = cam.screenToWorld(mouse.x, mouse.y, cam.farClip);
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
    var B = window.AlkkagiSharedBundle;
    if (!B) return 'SharedBundle not loaded';
    
    var inputNames = ['None','Up','Down','Left','Right','UpLeft','UpRight','DownLeft','DownRight'];
    return inputNames[this.lastInput] || 'Unknown';
};

// 디버그: 수동 입력 전송
InputManager.prototype.sendInput = function (inputValue) {
    var B = window.AlkkagiSharedBundle;
    var network = window.networkManager;
    
    if (!B) {
        console.error('[InputManager] SharedBundle not loaded');
        return;
    }
    if (!network) {
        console.error('[InputManager] NetworkManager not found');
        return;
    }
    if (!network.ws || network.ws.readyState !== WebSocket.OPEN) {
        console.error('[InputManager] WebSocket not open');
        return;
    }

    network.send(new B.C2S_MoveInputPacket(inputValue));
    console.log('[InputManager] Manual input sent:', inputValue);
};

// Clean up
InputManager.prototype.destroy = function () {
    console.log('[InputManager] Destroyed');
};