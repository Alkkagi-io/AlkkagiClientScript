var MobileInputManager = pc.createScript('mobileInputManager');

// [추가] 전역에서 접근 가능한 정적 변수 선언
MobileInputManager.instance = null;

MobileInputManager.prototype.initialize = function() {
    if (!pc.platform.mobile) {
        this.enabled = false;
        return;
    }

    // [추가] 싱글톤 인스턴스 할당
    MobileInputManager.instance = this;

    // [수정] 초기화 시점에는 AlkkagiSharedBundle 접근을 피하고 null로 설정
    this.lastInput = null; 
    this._lastBlockReason = null;

    // 공격 상태
    this.isCharging = false;
    
    // 현재 조이스틱 입력 벡터 (이동용)
    this.currentJoystickInput = new pc.Vec2(0, 0);

    // 마지막 비영(0,0) 이동 방향 (공격 에임 대체용)
    this._lastNonZeroDir = new pc.Vec2(1, 0);

    // [추가] 스크립트가 파괴될 때 인스턴스 해제 (씬 전환 등의 안전장치)
    this.on('destroy', function() {
        if (MobileInputManager.instance === this) {
            MobileInputManager.instance = null;
        }
    });

    console.log('[MobileInputManager] Initialized (Singleton)');
};

MobileInputManager.prototype.update = function(dt) {
    // 안전장치: 게임 매니저나 번들이 아직 로드되지 않았으면 리턴
    if (typeof AlkkagiSharedBundle === 'undefined' || window.gameManager == null) return;
    
    if (gameManager.playerEntityID == -1) return;

    const myPlayer = gameManager.getEntity(gameManager.playerEntityID);
    const characterComponent = myPlayer?.script?.characterEntityComponent ?? null;
    
    if (!myPlayer || !characterComponent || characterComponent.isDead) return;

    this._lastBlockReason = null;

    // ===== 이동 입력 처리 =====
    // 조이스틱 벡터를 8방향 Enum으로 변환
    var input = this._vec2ToInputEnum(this.currentJoystickInput);
    
    if (input !== this.lastInput) {
        this.lastInput = input;

        // 마지막 비영 방향 갱신
        if (this.currentJoystickInput.lengthSq() > 0.01) {
            this._lastNonZeroDir.copy(this.currentJoystickInput).normalize();
        }

        // 패킷 전송
        gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_MoveInputPacket(input));
    }

    // ===== 공격 상태 업데이트 (차징 중일 때 방향 갱신) =====
    if (this.isCharging) {
        var dir = this._getAimDirection();
        myPlayer.script.myPlayerComponent.handleChargingUpdate(dir);
    }
};

// --- 조이스틱에서 호출하는 메서드들 ---

MobileInputManager.prototype.setMoveInput = function(x, y) {
    this.currentJoystickInput.set(x, y);
};

MobileInputManager.prototype.stopMove = function() {
    this.currentJoystickInput.set(0, 0);
};

MobileInputManager.prototype.onChargeComplete = function() {
    // console.log("[MobileInput] Charge Ready!");
};

MobileInputManager.prototype.startChargeAttack = function() {
    if (this.isCharging) return;
    if (typeof AlkkagiSharedBundle === 'undefined') return; // 안전장치

    const myPlayer = gameManager.getEntity(gameManager.playerEntityID);
    if (myPlayer && myPlayer.script && myPlayer.script.myPlayerComponent) {
        myPlayer.script.myPlayerComponent.handleChargingStart();
        gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_StartAttackChargingPacket());
        this.isCharging = true;
        console.log('[MobileInput] Start Attack Charge');
    }
};

MobileInputManager.prototype.triggerChargeAttack = function() {
    if (!this.isCharging) return;
    this._finishAttack();
};

MobileInputManager.prototype.triggerDragAttack = function() {
    console.log("[MobileInput] Trigger Drag Attack");
    if (this.isCharging) {
        this._finishAttack();
    }
};

MobileInputManager.prototype._finishAttack = function() {
    if (typeof AlkkagiSharedBundle === 'undefined') return; // 안전장치

    const myPlayer = gameManager.getEntity(gameManager.playerEntityID);
    if (myPlayer && myPlayer.script && myPlayer.script.myPlayerComponent) {
        myPlayer.script.myPlayerComponent.handleChargingEnd();
        
        var dir = this._getAimDirection();
        var pkt = new AlkkagiSharedBundle.C2S_FinishAttackChargingPacket(new AlkkagiSharedBundle.Vector(dir.x, dir.y));
        
        gameManager.networkManager.send(pkt);
        this.isCharging = false;
        console.log(`[MobileInput] Finish Attack ${dir}`);
    }
};

// --- 헬퍼 메서드 ---

MobileInputManager.prototype._vec2ToInputEnum = function(vec) {
    // 번들이 로드되지 않았으면 None 반환
    if (typeof AlkkagiSharedBundle === 'undefined') return 0;

    if (vec.lengthSq() < 0.1) { 
        return AlkkagiSharedBundle.EMoveInput.None;
    }

    var angle = Math.atan2(vec.y, vec.x) * pc.math.RAD_TO_DEG;
    if (angle < 0) angle += 360; 

    if (angle >= 337.5 || angle < 22.5) return AlkkagiSharedBundle.EMoveInput.Right;
    if (angle >= 22.5 && angle < 67.5) return AlkkagiSharedBundle.EMoveInput.UpRight;
    if (angle >= 67.5 && angle < 112.5) return AlkkagiSharedBundle.EMoveInput.Up;
    if (angle >= 112.5 && angle < 157.5) return AlkkagiSharedBundle.EMoveInput.UpLeft;
    if (angle >= 157.5 && angle < 202.5) return AlkkagiSharedBundle.EMoveInput.Left;
    if (angle >= 202.5 && angle < 247.5) return AlkkagiSharedBundle.EMoveInput.DownLeft;
    if (angle >= 247.5 && angle < 292.5) return AlkkagiSharedBundle.EMoveInput.Down;
    if (angle >= 292.5 && angle < 337.5) return AlkkagiSharedBundle.EMoveInput.DownRight;

    return AlkkagiSharedBundle.EMoveInput.None;
};

MobileInputManager.prototype._getAimDirection = function() {
    if (this.currentJoystickInput.lengthSq() > 0.01) {
        return this.currentJoystickInput.clone().normalize();
    }
    return this._lastNonZeroDir.clone();
};