var UiJoystick = pc.createScript('uiJoystick');

// --- 조이스틱 기본 설정 ---
UiJoystick.attributes.add('handle', { type: 'entity', title: 'Handle Entity' });
UiJoystick.attributes.add('radius', { type: 'number', default: 75, title: 'Max Radius' });
UiJoystick.attributes.add('deadZone', { type: 'number', default: 10, title: 'Dead Zone' });
UiJoystick.attributes.add('sensitivity', { type: 'number', default: 1.0, title: 'Sensitivity' });

// --- 모드 선택 ---
UiJoystick.attributes.add('joystickMode', {
    type: 'number',
    title: 'Joystick Mode',
    enum: [
        { 'Normal Move': 0 },
        { 'Charge Mode': 1 },    // 제자리 차징
        { 'Drag Attack': 2 },    // 거리 드래그
        { 'Toggle Button': 3 }   // 버튼 장전식
    ],
    default: 0
});

// --- 세부 옵션 ---
UiJoystick.attributes.add('chargeTime', { type: 'number', default: 1.5, title: 'Charge Time (Sec)', description: 'For Mode 1' });
UiJoystick.attributes.add('chargeInputLimit', { type: 'number', default: 0.2, title: 'Charge Input Limit', description: 'Charge only when input is below this value (0~1)' });
UiJoystick.attributes.add('attackThreshold', { type: 'number', default: 0.9, title: 'Drag Threshold (0~1)', description: 'For Mode 2' });
UiJoystick.attributes.add('attackToggleBtn', { type: 'entity', title: 'Attack Button', description: 'For Mode 3' });


UiJoystick.prototype.initialize = function() {
    this.isDragging = false;
    this.input = new pc.Vec2(0, 0);
    this.startInputPos = new pc.Vec2();
    
    this.chargeTimer = 0;
    this.isCharging = false;
    this.isAttackMode = false; // Mode 3: 장전(Armed) 상태
    
    if (this.handle && this.handle.element) {
        this.defaultColor = this.handle.element.color.clone();
    }

    // 1. 조이스틱 이벤트 등록
    if (this.entity.element) {
        this.entity.element.on(pc.EVENT_TOUCHSTART, this.onStart, this);
        this.entity.element.on(pc.EVENT_TOUCHMOVE, this.onMove, this);
        this.entity.element.on(pc.EVENT_TOUCHEND, this.onEnd, this);
        this.entity.element.on(pc.EVENT_TOUCHCANCEL, this.onEnd, this);
        this.entity.element.on(pc.EVENT_MOUSEDOWN, this.onStart, this);
    }
    
    this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMoveGlobal, this);
    this.app.mouse.on(pc.EVENT_MOUSEUP, this.onEnd, this);

    // 2. [핵심] 공격 버튼 이벤트 및 차단 로직
    if (this.joystickMode === 3 && this.attackToggleBtn) {
        
        // 버튼 클릭 (토글 기능)
        if (this.attackToggleBtn.button) {
            this.attackToggleBtn.button.on('click', this.onToggleAttackClick, this);
        }

        // [중요] 버튼을 누르는 순간(TouchStart)이 조이스틱으로 전파되지 않도록 막음
        if (this.attackToggleBtn.element) {
            this.attackToggleBtn.element.on(pc.EVENT_TOUCHSTART, this.blockEvent, this);
            this.attackToggleBtn.element.on(pc.EVENT_MOUSEDOWN, this.blockEvent, this);
        }
    }
};

// 이벤트 전파 차단용 함수
UiJoystick.prototype.blockEvent = function(event) {
    if(event) event.stopPropagation();
};

// --- [버튼] 공격 장전 (ON/OFF) ---
UiJoystick.prototype.onToggleAttackClick = function(event) {
    // 안전장치
    if(event && event.stopPropagation) event.stopPropagation();

    // 상태 토글
    this.isAttackMode = !this.isAttackMode;
    
    console.log("[Mode 3] Attack Armed:", this.isAttackMode); // 로그 확인용

    // 버튼 시각적 피드백 (빨강: 장전됨, 흰색: 평상시)
    if (this.attackToggleBtn.element) {
        this.attackToggleBtn.element.color = this.isAttackMode ? pc.Color.RED : pc.Color.WHITE; 
    }
};

UiJoystick.prototype.update = function(dt) {
    // Mode 1: Charge Mode 로직
    if (this.joystickMode === 1 && this.isDragging) {
        var localPos = this.handle.getLocalPosition();
        var dist = Math.sqrt(localPos.x * localPos.x + localPos.y * localPos.y);
        var normalizedDist = dist / this.radius; 

        // 조금만 움직였을 때(chargeInputLimit 이하)만 차징
        if (normalizedDist <= this.chargeInputLimit) {
            if (!this.isCharging && !this.isAttackMode) {
                this.chargeTimer += dt;
                if (this.chargeTimer >= this.chargeTime) {
                    this.isCharging = true;
                    if (this.handle.element) this.handle.element.color = pc.Color.YELLOW;
                    if (MobileInputManager.instance) {
                        MobileInputManager.instance.onChargeComplete();
                        MobileInputManager.instance.startChargeAttack(); 
                    }
                }
            }
        } else {
            // 많이 움직이면 차징 초기화
            if (!this.isCharging) this.chargeTimer = 0;
        }
    }
};

UiJoystick.prototype.onStart = function(event) {
    // [중요] 버튼 터치 차단 로직이 있어도, 혹시 모르니 타겟 확인
    // (여기서는 this.entity.element에 걸었으므로 안전)

    this.isDragging = true;
    
    // Mode 3이 아닐 때만 터치 시 초기화
    if (this.joystickMode !== 3) {
        this.isAttackMode = false;
    }
    
    this.chargeTimer = 0;
    this.isCharging = false;

    if(event.event) event.event.stopPropagation();
    
    var x = (event.touches && event.touches[0]) ? event.touches[0].x : event.x;
    var y = (event.touches && event.touches[0]) ? event.touches[0].y : event.y;
    this.startInputPos.set(x, y);
    
    // --- Mode 3: 장전된 상태(RED)에서 조이스틱을 잡으면 -> 조준 시작(BLUE) ---
    if (this.joystickMode === 3 && this.isAttackMode) {
        console.log("[Mode 3] Start Aiming!"); // 로그 확인
        
        if (this.handle.element) this.handle.element.color = pc.Color.BLUE;
        
        // 이동 멈추고 조준선 표시
        if (MobileInputManager.instance) {
            MobileInputManager.instance.stopMove(); 
            MobileInputManager.instance.startChargeAttack();
        }
    } else {
        // 일반 이동 (RED)
        if (this.handle.element) this.handle.element.color = pc.Color.RED;
    }
};

UiJoystick.prototype.onEnd = function(event) {
    // 실제로 조이스틱을 드래그 중이 아니었다면 무시 (버튼 클릭 후 뗄 때 오작동 방지)
    if (!this.isDragging) return;

    if (MobileInputManager.instance) {
        // --- Mode 1 ---
        if (this.joystickMode === 1 && this.isCharging) {
            MobileInputManager.instance.setMoveInput(0, 0);
            MobileInputManager.instance.stopMove();
            MobileInputManager.instance.triggerChargeAttack();
        }
        // --- Mode 2 ---
        else if (this.joystickMode === 2 && this.isAttackMode) {
            MobileInputManager.instance.setMoveInput(0, 0);
            MobileInputManager.instance.stopMove();
            MobileInputManager.instance.triggerDragAttack();
        }
        // --- Mode 3: Toggle Attack ---
        else if (this.joystickMode === 3 && this.isAttackMode) {
            // 공격 발사
            console.log("[Mode 3] Fire Attack!"); 
            MobileInputManager.instance.setMoveInput(0, 0);
            MobileInputManager.instance.stopMove();
            MobileInputManager.instance.triggerDragAttack();
            
            // 발사 후 장전 해제
            this.isAttackMode = false;
            
            // 버튼 색상 원복
            if (this.attackToggleBtn && this.attackToggleBtn.element) {
                this.attackToggleBtn.element.color = pc.Color.WHITE;
            }
        }
        // --- Default ---
        else {
            MobileInputManager.instance.stopMove();
        }
    }

    // 상태 초기화
    this.isDragging = false;
    this.chargeTimer = 0;
    this.isCharging = false;
    
    // Mode 3이 아닐 때만 false 처리 (Mode 3은 위에서 처리했음)
    if (this.joystickMode !== 3) {
        this.isAttackMode = false;
    }

    this.input.set(0, 0);
    this.handle.setLocalPosition(0, 0, 0);
    
    if (this.handle.element) this.handle.element.color = this.defaultColor;
};

UiJoystick.prototype.onMove = function(event) {
    if (this.isDragging) this.updatePosition(event);
};

UiJoystick.prototype.onMoveGlobal = function(event) {
    if (this.isDragging && this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        this.updatePosition({ x: event.x, y: event.y });
    }
};

UiJoystick.prototype.updatePosition = function(event) {
    var currentX = (event.touches && event.touches[0]) ? event.touches[0].x : event.x;
    var currentY = (event.touches && event.touches[0]) ? event.touches[0].y : event.y;
    
    var dx = (currentX - this.startInputPos.x) * this.sensitivity;
    var dy = (this.startInputPos.y - currentY) * this.sensitivity; 

    var len = Math.sqrt(dx * dx + dy * dy);
    if (len > this.radius) {
        dx = (dx / len) * this.radius;
        dy = (dy / len) * this.radius;
    }
    this.handle.setLocalPosition(dx, dy, 0);
    
    // --- Mode 2: Drag Attack 로직 ---
    if (this.joystickMode === 2) {
        var normalizedLen = len / this.radius;
        if (normalizedLen > this.attackThreshold) {
            if (!this.isAttackMode) {
                this.isAttackMode = true;
                if (this.handle.element) this.handle.element.color = pc.Color.BLUE;
                if (MobileInputManager.instance) {
                    MobileInputManager.instance.stopMove();
                    MobileInputManager.instance.startChargeAttack();
                }
            }
        } else {
            if (this.isAttackMode) {
                this.isAttackMode = false;
                if (this.handle.element) this.handle.element.color = pc.Color.RED;
            }
        }
    }

    // --- 입력값 전송 ---
    if (len < this.deadZone) {
        this.input.set(0, 0);
        if (MobileInputManager.instance) MobileInputManager.instance.stopMove();
    } else {
        var inputX = dx / this.radius;
        var inputY = dy / this.radius;
        this.input.set(inputX, inputY);
        
        if (MobileInputManager.instance) {
            // Mode 3이고 장전 상태면 무조건 Aiming 로직 타도록 보장
            if (this.isAttackMode || this.isCharging) {
                 MobileInputManager.instance.setMoveInput(inputX, inputY);
            } else {
                 MobileInputManager.instance.setMoveInput(inputX, inputY);
            }
        }
    }
};