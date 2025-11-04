// 전역 싱글톤 카메라 매니저 (회전 제거 버전: X/Y만 추적, Z는 고정)
var CameraManager = (function() {
    'use strict';

    let _instance = null;

    function CameraManagerInstance() {
        // 카메라 및 추적 관련
        this.camera = null;
        this.target = null;
        this.followSpeed = 5;

        // 오프셋: X/Y는 타겟에 더해짐, Z는 "고정 z" 계산에만 사용됨
        this.offset = new pc.Vec3(0, 0, 15);

        // 스무딩
        this.smoothTime = 0.1;
        this.useSimpleFollow = true;

        // 경계 (X/Y 평면 기준)
        // boundary: (minX, minY, maxX, maxY)
        this.enableBoundary = false;
        this.boundary = new pc.Vec4(-100, -100, 100, 100);

        // 내부 상태
        this._smoothVelocity = new pc.Vec3();
        this._isFollowing = false;
        this._initialPosition = new pc.Vec3();
        this._isInitialized = false;

        // 고정 Z 계산용
        this._baseZ = 0; // 초기 카메라 Z
        this._getFixedZ = () => this._baseZ + this.offset.z;

        // (호환용, 회전 관련은 더 이상 사용하지 않음)
        this.enableLookAt = false;              // no-op
        this.lookAtOffset = new pc.Vec3(0,0,0); // no-op
        this.lookAtSpeed = 0;                   // no-op

        // 줌/FOV
        this.fov = 60;
        this._targetFov = 60;
        this.minFov = 10;
        this.maxFov = 100;
        this.enableZoom = false;
        this.zoomSpeed = 5;

        this.debug = false;
    }

    CameraManagerInstance.prototype = {
        _computeFollowAlpha: function(dt) {
            var effDt = (Number.isFinite(dt) && dt > 0)
                ? dt
                : (this.app && Number.isFinite(this.app.dt) && this.app.dt > 0 ? this.app.dt : 0.016);
            var speed = Math.max(0, this.followSpeed || 0);
            var alpha = 1 - Math.exp(-speed * effDt);
            if (!Number.isFinite(alpha)) alpha = 1;
            if (alpha < 0) alpha = 0; else if (alpha > 1) alpha = 1;
            return alpha;
        },

        // 초기화 (회전은 건드리지 않음)
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
            this._baseZ = initialPos.z; // 고정 Z의 기준

            // FOV 저장
            if (this.camera.camera && Number.isFinite(this.camera.camera.fov)) {
                this._targetFov = this.camera.camera.fov;
                this.fov = this.camera.camera.fov;
            }

            this._isInitialized = true;
            console.log('CameraManager initialized (rotation disabled, follow X/Y, fixed Z)');
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
                // this.resetToInitial();
            }
        },

        setFollowSpeed: function(speed) {
            this.followSpeed = Math.max(0, speed);
            if (this.followSpeed === 0) {
                // this.resetToInitial();
            } else if (this._isFollowing) {
                this.snapToTarget();
            }
        },

        startFollowing: function() {
            if (this.target && this.followSpeed > 0) {
                this._isFollowing = true;
                this.snapToTarget();
            }
        },

        stopFollowing: function() {
            this._isFollowing = false;
            // this.resetToInitial();
        },

        isFollowing: function() {
            return this._isFollowing && this.followSpeed > 0;
        },

        // 초기 위치로 복귀 (회전은 건드리지 않음)
        resetToInitial: function() {
            if (!this._isInitialized) return;
            this.camera.setPosition(this._initialPosition);
        },

        // 감속 이동 (벡터 단위)
        smoothDamp: function(current, target, velocity, smoothTime) {
            if (!Number.isFinite(smoothTime) || smoothTime <= 1e-6) {
                console.warn('CameraManager: Invalid smoothTime value, snapping to target');
                velocity.set(0, 0, 0);
                return target.clone();
            }

            const maxSpeed = Infinity;
            const deltaTime = this.app ? this.app.dt : 0.016;

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

        // 경계 클램프 (X/Y만)
        clampToBoundary: function(position) {
            if (!this.enableBoundary) return position;

            const clampedPos = position.clone();
            clampedPos.x = pc.math.clamp(clampedPos.x, this.boundary.x, this.boundary.z); // minX ~ maxX
            clampedPos.y = pc.math.clamp(clampedPos.y, this.boundary.y, this.boundary.w); // minY ~ maxY
            return clampedPos;
        },

        // 즉시 타겟으로 스냅 (X/Y만 타겟 + 오프셋, Z는 고정)
        snapToTarget: function() {
            if (!this._isInitialized || !this.target) return;

            const tpos = this.target.getPosition();
            if (!Number.isFinite(tpos.x) || !Number.isFinite(tpos.y) || !Number.isFinite(tpos.z)) {
                console.warn('CameraManager: Invalid target position, skipping snapToTarget');
                return;
            }

            const fixedZ = this._getFixedZ();
            let desiredPosition = new pc.Vec3(
                tpos.x + this.offset.x,
                tpos.y + this.offset.y,
                fixedZ
            );

            if (!Number.isFinite(desiredPosition.x) || !Number.isFinite(desiredPosition.y) || !Number.isFinite(desiredPosition.z)) {
                console.warn('CameraManager: Invalid desired position, using current position');
                return;
            }

            desiredPosition = this.clampToBoundary(desiredPosition);
            this.camera.setPosition(desiredPosition);
            // 회전은 전혀 건드리지 않음
        },

        // 매 프레임 업데이트 (X/Y만 추적, Z 고정 / 회전 무시)
        update: function(dt) {
            if (this.debug) {
                try {
                    var tname = this.target ? this.target.name : 'null';
                    console.log('[CameraManager] following=', this._isFollowing, ' target=', tname);
                } catch (e) { /* noop */ }
            }

            if (!this._isInitialized || this.followSpeed === 0 || !this._isFollowing || !this.target) return;

            const tpos = this.target.getPosition();
            if (!Number.isFinite(tpos.x) || !Number.isFinite(tpos.y) || !Number.isFinite(tpos.z)) {
                console.warn('CameraManager: Invalid target position in update, skipping frame');
                return;
            }

            const fixedZ = this._getFixedZ();
            const desiredPosition = new pc.Vec3(
                tpos.x + this.offset.x,
                tpos.y + this.offset.y,
                fixedZ
            );

            if (!Number.isFinite(desiredPosition.x) || !Number.isFinite(desiredPosition.y) || !Number.isFinite(desiredPosition.z)) {
                console.warn('CameraManager: Invalid desired position in update, skipping frame');
                return;
            }

            // 위치 추적 (X/Y만 스무딩, Z는 고정)
            let newPosition;
            const curPos = this.camera.getPosition();

            if (this.useSimpleFollow) {
                const alpha = this._computeFollowAlpha(dt);
                newPosition = new pc.Vec3();
                // X/Y는 보간
                newPosition.x = pc.math.lerp(curPos.x, desiredPosition.x, alpha);
                newPosition.y = pc.math.lerp(curPos.y, desiredPosition.y, alpha);
                // Z는 고정
                newPosition.z = fixedZ;
            } else {
                // smoothDamp는 벡터 전체를 보간하므로, 적용 후 Z를 다시 고정
                newPosition = this.smoothDamp(curPos, desiredPosition, this._smoothVelocity, this.smoothTime);
                newPosition.z = fixedZ;
            }

            if (!Number.isFinite(newPosition.x) || !Number.isFinite(newPosition.y) || !Number.isFinite(newPosition.z)) {
                console.warn('CameraManager: Invalid new position from smoothing, using desired position');
                newPosition = desiredPosition;
            }

            newPosition = this.clampToBoundary(newPosition);
            this.camera.setPosition(newPosition);

            // 회전은 전혀 업데이트하지 않음
        },

        // 카메라 흔들림 (포지션만 변동, Z는 고정)
        shake: function(intensity, duration) {
            if (!this._isInitialized) return;

            intensity = intensity || 1;
            duration = duration || 0.5;

            const originalPosition = this.camera.getPosition().clone();
            const fixedZ = this._getFixedZ();
            const startTime = this.app ? this.app.time : Date.now() / 1000;

            const shakeUpdate = () => {
                const elapsed = (this.app ? this.app.time : Date.now() / 1000) - startTime;

                if (elapsed < duration) {
                    const progress = elapsed / duration;
                    const currentIntensity = intensity * (1 - progress);

                    // X/Y만 흔들고 Z는 고정
                    const randomOffset = new pc.Vec3(
                        (Math.random() - 0.5) * currentIntensity,
                        (Math.random() - 0.5) * currentIntensity,
                        0
                    );

                    const next = originalPosition.clone().add(randomOffset);
                    next.z = fixedZ;

                    this.camera.setPosition(next);
                } else {
                    const reset = originalPosition.clone();
                    reset.z = fixedZ;
                    this.camera.setPosition(reset);

                    if (this.app) this.app.off('update', shakeUpdate);
                }
            };

            if (this.app) {
                this.app.on('update', shakeUpdate);
            }
        },

        // 오프셋 설정 (offset.z 변경 시 고정 Z도 반영)
        setOffset: function(x, y, z) {
            if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
                this.offset.set(x, y, z);
            } else {
                console.warn('CameraManager: Invalid offset values, ignoring');
            }
        },

        // 경계 설정 (X/Y용)
        setBoundary: function(minX, minY, maxX, maxY) {
            if (Number.isFinite(minX) && Number.isFinite(minY) &&
                Number.isFinite(maxX) && Number.isFinite(maxY)) {
                this.boundary.set(minX, minY, maxX, maxY);
                this.enableBoundary = true;
            } else {
                console.warn('CameraManager: Invalid boundary values, ignoring');
            }
        },

        disableBoundary: function() {
            this.enableBoundary = false;
        },

        getMode: function() {
            if (this.followSpeed === 0) return 'fixed';
            if (this._isFollowing) return 'following';
            return 'idle';
        },

        // 런타임 설정 (회전 관련 키는 무시됨)
        configure: function(config) {
            if (config.followSpeed !== undefined) {
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
                if (Number.isFinite(config.smoothTime) && config.smoothTime > 1e-6) {
                    this.smoothTime = config.smoothTime;
                } else {
                    console.warn('CameraManager: Invalid smoothTime value, must be > 1e-6, ignoring');
                }
            }
            if (config.boundary !== undefined) {
                if (config.boundary &&
                    Number.isFinite(config.boundary.minX) &&
                    Number.isFinite(config.boundary.minY) &&
                    Number.isFinite(config.boundary.maxX) &&
                    Number.isFinite(config.boundary.maxY)) {
                    this.setBoundary(
                        config.boundary.minX, config.boundary.minY,
                        config.boundary.maxX, config.boundary.maxY
                    );
                } else {
                    console.warn('CameraManager: Invalid boundary values, ignoring');
                }
            }
            // 회전 관련(enableLookAt, lookAtSpeed 등)은 no-op
        },

        // ---- FOV / 줌 ----
        setFOV: function(fov) {
            if (!this._isInitialized) {
                console.error('CameraManager not initialized. Call initialize() first.');
                return;
            }
            if (!Number.isFinite(fov)) {
                console.warn('CameraManager: Invalid FOV value, ignoring');
                return;
            }
            fov = pc.math.clamp(fov, this.minFov, this.maxFov);
            this._targetFov = fov;

            if (!this.enableZoom) {
                this.fov = fov;
                this.camera.camera.fov = fov;
            }
        },

        setEnableZoom: function(enable) {
            this.enableZoom = !!enable;
        },

        setZoomSpeed: function(speed) {
            if (Number.isFinite(speed) && speed > 0) {
                this.zoomSpeed = speed;
            } else {
                console.warn('CameraManager: Invalid zoom speed value, ignoring');
            }
        },

        setFOVRange: function(minFov, maxFov) {
            if (Number.isFinite(minFov) && Number.isFinite(maxFov) && minFov > 0 && maxFov > minFov) {
                this.minFov = minFov;
                this.maxFov = maxFov;
                this.fov = pc.math.clamp(this.fov, this.minFov, this.maxFov);
                this._targetFov = pc.math.clamp(this._targetFov, this.minFov, this.maxFov);
            } else {
                console.warn('CameraManager: Invalid FOV range values, ignoring');
            }
        },

        getFOV: function() {
            return this.fov;
        },

        setApp: function(app) {
            this.app = app;
        }
    };

    // public API
    return {
        getInstance: function() {
            if (!_instance) _instance = new CameraManagerInstance();
            return _instance;
        },

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

        // NOTE: 인자 순서는 (minX, minY, maxX, maxY)
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