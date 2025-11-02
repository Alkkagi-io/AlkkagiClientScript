// 전역 싱글톤 카메라 매니저
var CameraManager = (function() {
    'use strict';
    
    // private 변수
    let _instance = null;
    
    // 생성자 함수
    function CameraManagerInstance() {
        // 카메라 관련 속성들
        this.camera = null;
        this.target = null;
        this.followSpeed = 5;
        this.offset = new pc.Vec3(0, 10, 0);
        this.smoothTime = 0.1;
        this.enableBoundary = false;
        this.boundary = new pc.Vec4(-100, -100, 100, 100);
        this.enableLookAt = true;
        this.lookAtOffset = new pc.Vec3(0, 0, 0);
        this.lookAtSpeed = 10;
        this.useSimpleFollow = true;
        this.preferredUp = new pc.Vec3(0, 1, 0);
        
        // 내부 상태 변수들
        this._smoothVelocity = new pc.Vec3();
        this._isFollowing = false;
        this._initialPosition = new pc.Vec3();
        this._initialRotation = new pc.Quat();
        this._isInitialized = false;
    }
    
    // 인스턴스 메서드들
    CameraManagerInstance.prototype = {
        _computeFollowAlpha: function(dt) {
            var effDt = (Number.isFinite(dt) && dt > 0) ? dt : (this.app && Number.isFinite(this.app.dt) && this.app.dt > 0 ? this.app.dt : 0.016);
            var speed = Math.max(0, this.followSpeed || 0);
            var alpha = 1 - Math.exp(-speed * effDt);
            if (!Number.isFinite(alpha)) alpha = 1;
            if (alpha < 0) alpha = 0; else if (alpha > 1) alpha = 1;
            return alpha;
        },
        _safeUpFor: function(dir) {
            if (!dir) return this.preferredUp;
            var d = dir.clone();
            if (d.lengthSq() === 0) return this.preferredUp;
            d.normalize();
            var up = this.preferredUp;
            var dot = Math.abs(d.dot(up));
            if (dot > 0.999) {
                // fallback to X axis if too parallel
                return new pc.Vec3(1, 0, 0);
            }
            return up;
        },
        // 초기화
        initialize: function(cameraEntity) {
            if (this._isInitialized) {
                console.warn('CameraManager already initialized');
                return;
            }
            
            if (!cameraEntity) {
                console.error('CameraManager: cameraEntity is null or undefined');
                return;
            }
            
            this.camera = cameraEntity;
            
            const initialPos = this.camera.getPosition();
            if (!initialPos || !Number.isFinite(initialPos.x) || !Number.isFinite(initialPos.y) || !Number.isFinite(initialPos.z)) {
                console.error('CameraManager: Invalid initial camera position');
                return;
            }
            this._initialPosition.copy(initialPos);
            
            const initialRot = this.camera.getRotation();
            if (!initialRot || 
                !Number.isFinite(initialRot.x) || 
                !Number.isFinite(initialRot.y) || 
                !Number.isFinite(initialRot.z) || 
                !Number.isFinite(initialRot.w)) {
                console.error('CameraManager: Invalid initial camera rotation (null or invalid xyzw)');
                // 기본 회전값으로 대체
                this._initialRotation.set(0, 0, 0, 1);
            } else {
                this._initialRotation.copy(initialRot);
            }
            
            // 초기 FOV 저장
            if (this.camera.camera && this.camera.camera.fov) {
                this._initialFov = this.camera.camera.fov;
                this.fov = this._initialFov;
                this._targetFov = this._initialFov;
            }
            
            this._isInitialized = true;
            
            console.log('CameraManager initialized');
        },
        
        // 추적 대상 설정
        setTarget: function(targetEntity) {
            if (!this._isInitialized) {
                console.error('CameraManager not initialized. Call initialize() first.');
                return;
            }
            
            this.target = targetEntity;
            this._isFollowing = !!targetEntity;
            
            if (this._isFollowing && this.followSpeed > 0) {
                this.snapToTarget();
            } else if (!this._isFollowing || this.followSpeed === 0) {
                this.resetToInitial();
            }
        },
        
        // 추적 속도 설정
        setFollowSpeed: function(speed) {
            this.followSpeed = Math.max(0, speed);
            
            if (this.followSpeed === 0) {
                this.resetToInitial();
            } else if (this._isFollowing) {
                this.snapToTarget();
            }
        },
        
        // 추적 시작
        startFollowing: function() {
            if (this.target && this.followSpeed > 0) {
                this._isFollowing = true;
                this.snapToTarget();
            }
        },
        
        // 추적 중지
        stopFollowing: function() {
            this._isFollowing = false;
            this.resetToInitial();
        },
        
        // 추적 상태 확인
        isFollowing: function() {
            return this._isFollowing && this.followSpeed > 0;
        },
        
        // 초기 위치로 복귀
        resetToInitial: function() {
            if (!this._isInitialized) return;
            this.camera.setPosition(this._initialPosition);
            this.camera.setRotation(this._initialRotation);
        },
        
        // 부드러운 감속 이동 (수정됨 - 방어 코드 추가)
        smoothDamp: function(current, target, velocity, smoothTime) {
            // 방어 코드: smoothTime이 0이거나 비정상적인 값인 경우 처리
            if (!Number.isFinite(smoothTime) || smoothTime <= 1e-6) {
                console.warn('CameraManager: Invalid smoothTime value, snapping to target');
                velocity.set(0, 0, 0);
                return target.clone();
            }
            
            const maxSpeed = Infinity;
            const deltaTime = this.app ? this.app.dt : 0.016; // fallback
            
            velocity.scale(1 / smoothTime, velocity);
            velocity.sub(target.clone().sub(current).scale(1 / smoothTime), velocity);
            
            const magnitude = velocity.length();
            const maxMagnitude = maxSpeed * smoothTime;
            
            if (magnitude > maxMagnitude) {
                velocity.normalize().scale(maxMagnitude, velocity);
            }
            
            const result = current.clone().add(velocity.clone().scale(deltaTime));
            
            if (target.clone().sub(result).dot(velocity) < 0) {
                result.copy(target);
                velocity.set(0, 0, 0);
            }
            
            return result;
        },
        
        // 경계 체크
        clampToBoundary: function(position) {
            if (!this.enableBoundary) {
                return position;
            }
            
            const clampedPos = position.clone();
            clampedPos.x = pc.math.clamp(clampedPos.x, this.boundary.x, this.boundary.z);
            clampedPos.y = pc.math.clamp(clampedPos.y, this.boundary.y, this.boundary.w);
            
            return clampedPos;
        },
        
        // 대상으로 즉시 이동 (수정됨 - 방어 코드 추가)
        snapToTarget: function() {
            if (!this._isInitialized || !this.target) return;
            
            const targetPos = this.target.getPosition();
            
            // 방어 코드: 타겟 위치가 비정상적인 경우 처리
            if (!Number.isFinite(targetPos.x) || !Number.isFinite(targetPos.y) || !Number.isFinite(targetPos.z)) {
                console.warn('CameraManager: Invalid target position, skipping snapToTarget');
                return;
            }
            
            let desiredPosition = targetPos.clone().add(this.offset);
            
            // 방어 코드: 계산된 위치가 비정상적인 경우 처리
            if (!Number.isFinite(desiredPosition.x) || !Number.isFinite(desiredPosition.y) || !Number.isFinite(desiredPosition.z)) {
                console.warn('CameraManager: Invalid desired position, using current position');
                return;
            }
            
            // 경계 적용
            desiredPosition = this.clampToBoundary(desiredPosition);
            this.camera.setPosition(desiredPosition);
            
            if (this.enableLookAt && this.lookAtSpeed > 0) {
                const lookAtPosition = targetPos.clone().add(this.lookAtOffset);
                
                // 방어 코드: lookAt 위치가 비정상적인 경우 처리
                if (Number.isFinite(lookAtPosition.x) && Number.isFinite(lookAtPosition.y) && Number.isFinite(lookAtPosition.z)) {
                    // 안전: 기존 회전 백업 후 적용하고 유효성 검사
                    var prevRot = this.camera.getRotation();
                    var prevCopy = new pc.Quat();
                    if (prevRot && typeof prevRot.x === 'number') {
                        prevCopy.copy(prevRot);
                    }
                    var camPos = this.camera.getPosition();
                    var dir = lookAtPosition.clone().sub(camPos);
                    var upVec = this._safeUpFor(dir);
                    this.camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z, upVec);
                    var applied = this.camera.getRotation();
                    if (!applied || !Number.isFinite(applied.x) || !Number.isFinite(applied.y) || !Number.isFinite(applied.z) || !Number.isFinite(applied.w)) {
                        console.warn('CameraManager: Invalid rotation after lookAt in snapToTarget, reverting');
                        this.camera.setRotation(prevCopy);
                    }
                } else {
                    console.warn('CameraManager: Invalid lookAt position, skipping lookAt');
                }
            }
        },
        
        // 매 프레임 업데이트 (수정됨 - 방어 코드 추가)
        update: function(dt) {
            // Debug: log current follow target name each frame
            try {
                var tname = this.target ? this.target.name : 'null';
                console.error('[CameraManager] following=', this._isFollowing, ' target=', tname);
            } catch (e) { /* noop */ }

            if (!this._isInitialized || this.followSpeed === 0 || !this._isFollowing || !this.target) {
                return;
            }
            
            const targetPos = this.target.getPosition();
            
            // 방어 코드: 타겟 위치가 비정상적인 경우 처리
            if (!Number.isFinite(targetPos.x) || !Number.isFinite(targetPos.y) || !Number.isFinite(targetPos.z)) {
                console.warn('CameraManager: Invalid target position in update, skipping frame');
                return;
            }
            
            const desiredPosition = targetPos.clone().add(this.offset);
            const lookAtPosition = targetPos.clone().add(this.lookAtOffset);
            
            // 방어 코드: 계산된 위치가 비정상적인 경우 처리
            if (!Number.isFinite(desiredPosition.x) || !Number.isFinite(desiredPosition.y) || !Number.isFinite(desiredPosition.z)) {
                console.warn('CameraManager: Invalid desired position in update, skipping frame');
                return;
            }
            
            // 위치 추적
            let newPosition;
            if (this.useSimpleFollow) {
                const alpha = this._computeFollowAlpha(dt);
                const curPos = this.camera.getPosition();
                newPosition = new pc.Vec3();
                newPosition.lerp(curPos, desiredPosition, alpha);
            } else {
                newPosition = this.smoothDamp(this.camera.getPosition(), desiredPosition, 
                                              this._smoothVelocity, this.smoothTime);
            }
            
            // 방어 코드: 계산된 새 위치가 비정상적인 경우 처리
            if (!Number.isFinite(newPosition.x) || !Number.isFinite(newPosition.y) || !Number.isFinite(newPosition.z)) {
                console.warn('CameraManager: Invalid new position from smoothDamp, using desired position');
                newPosition = desiredPosition;
            }
            
            newPosition = this.clampToBoundary(newPosition);
            this.camera.setPosition(newPosition);
            
            // 회전 추적
            if (this.enableLookAt && this.lookAtSpeed > 0) {
                // 방어 코드: lookAt 위치가 비정상적인 경우 처리
                if (!Number.isFinite(lookAtPosition.x) || !Number.isFinite(lookAtPosition.y) || !Number.isFinite(lookAtPosition.z)) {
                    console.warn('CameraManager: Invalid lookAt position in update, skipping rotation');
                    return;
                }
                
                const currentRotation = this.camera.getRotation();
                
                // 방어 코드: currentRotation이 null이거나 유효하지 않은 경우 처리
                if (!currentRotation || 
                    !Number.isFinite(currentRotation.x) || 
                    !Number.isFinite(currentRotation.y) || 
                    !Number.isFinite(currentRotation.z) || 
                    !Number.isFinite(currentRotation.w)) {
                    console.warn('CameraManager: Invalid currentRotation (null or invalid xyzw), skipping rotation update');
                    return;
                }
                
                const tempEntity = new pc.Entity();
                const camPos2 = this.camera.getPosition();
                tempEntity.setPosition(camPos2);
                var dir2 = lookAtPosition.clone().sub(camPos2);
                var upVec2 = this._safeUpFor(dir2);
                tempEntity.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z, upVec2);
                const targetRotation = tempEntity.getRotation();
                
                // 방어 코드: targetRotation이 null이거나 유효하지 않은 경우 처리
                if (!targetRotation || 
                    !Number.isFinite(targetRotation.x) || 
                    !Number.isFinite(targetRotation.y) || 
                    !Number.isFinite(targetRotation.z) || 
                    !Number.isFinite(targetRotation.w)) {
                    console.warn('CameraManager: Invalid targetRotation (null or invalid xyzw), skipping rotation update');
                    return;
                }
                
                const newRotation = currentRotation.slerp(targetRotation, this.lookAtSpeed * dt);
                
                if (!newRotation ||
                    !Number.isFinite(newRotation.x) ||
                    !Number.isFinite(newRotation.y) ||
                    !Number.isFinite(newRotation.z) ||
                    !Number.isFinite(newRotation.w)) {
                    // fallback: 클램프된 t로 재시도
                    const tClamp = pc.math.clamp((Number.isFinite(dt) ? dt : 0.016) * this.lookAtSpeed, 0, 1);
                    const safeRot = new pc.Quat();
                    safeRot.slerp(currentRotation, targetRotation, tClamp);
                    if (Number.isFinite(safeRot.x) && Number.isFinite(safeRot.y) && Number.isFinite(safeRot.z) && Number.isFinite(safeRot.w)) {
                        this.camera.setRotation(safeRot);
                        return;
                    }
                    console.warn('CameraManager: Invalid newRotation from slerp, skipping rotation update');
                    return;
                }
                
                this.camera.setRotation(newRotation);
            }
        },
        
        // 카메라 흔들림 효과
        shake: function(intensity, duration) {
            if (!this._isInitialized) return;
            
            intensity = intensity || 1;
            duration = duration || 0.5;
            
            const originalPosition = this.camera.getPosition().clone();
            const startTime = this.app ? this.app.time : Date.now() / 1000;
            
            const shakeUpdate = () => {
                const elapsed = (this.app ? this.app.time : Date.now() / 1000) - startTime;
                
                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    const currentIntensity = intensity * (1 - progress);
                    
                    const randomOffset = new pc.Vec3(
                        (Math.random() - 0.5) * currentIntensity,
                        (Math.random() - 0.5) * currentIntensity,
                        (Math.random() - 0.5) * currentIntensity * 0.5
                    );
                    
                    this.camera.setPosition(originalPosition.clone().add(randomOffset));
                } else {
                    this.camera.setPosition(originalPosition);
                    if (this.app) {
                        this.app.off('update', shakeUpdate);
                    }
                }
            };
            
            if (this.app) {
                this.app.on('update', shakeUpdate);
            }
        },
        
        // 오프셋 동적 변경
        setOffset: function(x, y, z) {
            // 방어 코드: 입력값 검증
            if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
                this.offset.set(x, y, z);
            } else {
                console.warn('CameraManager: Invalid offset values, ignoring');
            }
        },
        
        // 경계 동적 설정
        setBoundary: function(minX, minY, maxX, maxY) {
            // 방어 코드: 입력값 검증
            if (Number.isFinite(minX) && Number.isFinite(minY) && 
                Number.isFinite(maxX) && Number.isFinite(maxY)) {
                this.boundary.set(minX, minY, maxX, maxY);
                this.enableBoundary = true;
            } else {
                console.warn('CameraManager: Invalid boundary values, ignoring');
            }
        },
        
        // 경계 비활성화
        disableBoundary: function() {
            this.enableBoundary = false;
        },
        
        // 현재 카메라 모드 확인
        getMode: function() {
            if (this.followSpeed === 0) {
                return 'fixed';
            } else if (this._isFollowing) {
                return 'following';
            } else {
                return 'idle';
            }
        },
        
        // 런타임에 모든 속성을 한번에 설정 (수정됨 - 방어 코드 추가)
        configure: function(config) {
            if (config.followSpeed !== undefined) {
                // 방어 코드: 입력값 검증
                if (Number.isFinite(config.followSpeed)) {
                    this.setFollowSpeed(config.followSpeed);
                } else {
                    console.warn('CameraManager: Invalid followSpeed value, ignoring');
                }
            }
            if (config.useSimpleFollow !== undefined) {
                this.useSimpleFollow = !!config.useSimpleFollow;
            }
            if (config.offset !== undefined) {
                // 방어 코드: 입력값 검증
                if (config.offset && 
                    Number.isFinite(config.offset.x) && 
                    Number.isFinite(config.offset.y) && 
                    Number.isFinite(config.offset.z)) {
                    this.setOffset(config.offset.x, config.offset.y, config.offset.z);
                } else {
                    console.warn('CameraManager: Invalid offset values, ignoring');
                }
            }
            if (config.smoothTime !== undefined) {
                // 방어 코드: 입력값 검증
                if (Number.isFinite(config.smoothTime) && config.smoothTime > 1e-6) {
                    this.smoothTime = config.smoothTime;
                } else {
                    console.warn('CameraManager: Invalid smoothTime value, must be > 1e-6, ignoring');
                }
            }
            if (config.enableLookAt !== undefined) {
                this.enableLookAt = !!config.enableLookAt;
            }
            if (config.lookAtSpeed !== undefined) {
                // 방어 코드: 입력값 검증
                if (Number.isFinite(config.lookAtSpeed)) {
                    this.lookAtSpeed = config.lookAtSpeed;
                } else {
                    console.warn('CameraManager: Invalid lookAtSpeed value, ignoring');
                }
            }
            if (config.boundary !== undefined) {
                // 방어 코드: 입력값 검증
                if (config.boundary && 
                    Number.isFinite(config.boundary.minX) && 
                    Number.isFinite(config.boundary.minY) && 
                    Number.isFinite(config.boundary.maxX) && 
                    Number.isFinite(config.boundary.maxY)) {
                    this.setBoundary(config.boundary.minX, config.boundary.minY, 
                                   config.boundary.maxX, config.boundary.maxY);
                } else {
                    console.warn('CameraManager: Invalid boundary values, ignoring');
                }
            }
        },
        
        // FOV 설정
        setFOV: function(fov) {
            if (!this._isInitialized) {
                console.error('CameraManager not initialized. Call initialize() first.');
                return;
            }
            
            // 방어 코드: 입력값 검증
            if (!Number.isFinite(fov)) {
                console.warn('CameraManager: Invalid FOV value, ignoring');
                return;
            }
            
            // FOV 범위 제한
            fov = pc.math.clamp(fov, this.minFov, this.maxFov);
            this._targetFov = fov;
            
            if (!this.enableZoom) {
                // 즉시 적용
                this.fov = fov;
                this.camera.camera.fov = fov;
            }
        },
        
        // 줌 기능 활성화/비활성화
        setEnableZoom: function(enable) {
            this.enableZoom = !!enable;
        },
        
        // 줌 속도 설정
        setZoomSpeed: function(speed) {
            if (Number.isFinite(speed) && speed > 0) {
                this.zoomSpeed = speed;
            } else {
                console.warn('CameraManager: Invalid zoom speed value, ignoring');
            }
        },
        
        // FOV 범위 설정
        setFOVRange: function(minFov, maxFov) {
            if (Number.isFinite(minFov) && Number.isFinite(maxFov) && minFov > 0 && maxFov > minFov) {
                this.minFov = minFov;
                this.maxFov = maxFov;
                
                // 현재 FOV가 새 범위를 벗어나면 조정
                this.fov = pc.math.clamp(this.fov, this.minFov, this.maxFov);
                this._targetFov = pc.math.clamp(this._targetFov, this.minFov, this.maxFov);
            } else {
                console.warn('CameraManager: Invalid FOV range values, ignoring');
            }
        },
        
        // 현재 FOV 가져오기
        getFOV: function() {
            return this.fov;
        },
        
        // 앱 참조 설정
        setApp: function(app) {
            this.app = app;
        }
    };
    
    // public API
    return {
        getInstance: function() {
            if (!_instance) {
                _instance = new CameraManagerInstance();
            }
            return _instance;
        },
        
        // 편의 메서드들
        initialize: function(cameraEntity, app) {
            const instance = this.getInstance();
            instance.setApp(app);
            instance.initialize(cameraEntity);
            return instance;
        },
        
        setTarget: function(targetEntity) {
            return this.getInstance().setTarget(targetEntity);
        },
        
        startFollowing: function() {
            return this.getInstance().startFollowing();
        },
        
        stopFollowing: function() {
            return this.getInstance().stopFollowing();
        },
        
        update: function(dt) {
            return this.getInstance().update(dt);
        },
        
        shake: function(intensity, duration) {
            return this.getInstance().shake(intensity, duration);
        },
        
        setFollowSpeed: function(speed) {
            return this.getInstance().setFollowSpeed(speed);
        },
        
        setOffset: function(x, y, z) {
            return this.getInstance().setOffset(x, y, z);
        },
        
        setBoundary: function(minX, minY, maxX, maxY) {
            return this.getInstance().setBoundary(minX, minY, maxX, maxY);
        },
        
        configure: function(config) {
            return this.getInstance().configure(config);
        },
        
        getMode: function() {
            return this.getInstance().getMode();
        },
        
        isFollowing: function() {
            return this.getInstance().isFollowing();
        }
    };
})();
