const Bootstrap = pc.createScript('bootstrap');

Bootstrap.attributes.add('mainCamera', { type: 'entity' });
Bootstrap.attributes.add('entityTemplates', { type: 'asset', assetType: 'template', array: true });

Bootstrap.attributes.add('ingameUISoundTable', {
    type: 'string',
    array: true
});

Bootstrap.attributes.add('ingameUISoundLibrary', {
    type: 'asset',
    assetType: 'audio',
    array: true
});

Bootstrap.prototype.initialize = async function() {
    AudioManager.setGlobalVolume(0.1);

    const ingameUISoundMap = new Map();
    for(let i = 0; i < this.ingameUISoundTable.length; i++) {
        const soundSlot = this.ingameUISoundTable[i];
        const soundAsset = this.ingameUISoundLibrary[i];
        ingameUISoundMap.set(soundSlot, soundAsset);
    }

    // SharedBundle 로드 전 먼저 등록
    window.uiManager = new UIManager(ingameUISoundMap);
    window.uiTweener = new UITweener();

    await SharedCodeLoader.initialize();
    await ResourceManager.initialize();

    Object.values(AlkkagiSharedBundle.EEntityType).forEach(entityType => {
        this.RegisterFactory(entityType);
    });
    
    const networkOptions = createNetworkOptions({ address: Define.WS_ADDRESS });
    const networkManager = new NetworkManager(networkOptions);
    networkManager.events.on('connected', this.onConnected, this);
    networkManager.events.on('disconnected', this.onDisconnected, this);
    networkManager.events.on('error', this.onError, this);

    window.gameManager = new GameManager(networkManager, this.mainCamera);

    // CameraManager 초기화
    this.initializeCameraManager();

    buildPacketManager(window.gameManager, networkManager);

    networkManager.connect();
};

Bootstrap.prototype.postInitialize = function() {
    const isMobile = pc.platform.mobile;
    const resolutionWidth = isMobile ? 1080 : 1920;
    const resolutionHeight = isMobile ? 1920 : 1080;
    this.app.setCanvasResolution(pc.RESOLUTION_FIXED, resolutionWidth, resolutionHeight);
    this.app.resizeCanvas(window.innerWidth, window.innerHeight);
};

Bootstrap.prototype.onConnected = function() {
    uiManager.showScreen('title');
};

Bootstrap.prototype.onDisconnected = function() {
    uiManager.createBlockDiv('서버 점검 중입니다. 잠시 후 다시 시도해주세요.');
};

Bootstrap.prototype.onError = function(error) {
    uiManager.createBlockDiv('서버 점검 중입니다. 잠시 후 다시 시도해주세요.');
};

Bootstrap.prototype.RegisterFactory = function(type) {
    if(type == AlkkagiSharedBundle.EEntityType.None) {
        return;
    }

    const index = type - 1;
    if(index < 0 || index >= this.entityTemplates.length) {
        return;
    }
    
    EntityFactory.on(type, this.entityTemplates[index]);
};

// CameraManager 초기화
Bootstrap.prototype.initializeCameraManager = function() {
    if (!this.mainCamera) {
        console.warn('[Bootstrap] Main camera not assigned. CameraManager will not be initialized.');
        return;
    }
    
    try {
        // CameraManager 초기화
        window.cameraManager = CameraManager.initialize(this.mainCamera, this.app);
        
        // 기본 설정
        window.cameraManager.configure({
            followSpeed: 5,
            smoothTime: 0.1,
            enableLookAt: true,
            lookAtSpeed: 10,
            offset: { x: 0, y: 0, z: 0 }
        });
        
        console.log('[Bootstrap] CameraManager initialized successfully');
    } catch (error) {
        console.error('[Bootstrap] Failed to initialize CameraManager:', error);
    }
};

// Update 루프에서 CameraManager 업데이트
Bootstrap.prototype.update = function(dt) {
    if (window.cameraManager) {
        window.cameraManager.update(dt);
    }

    if (window.uiTweener) {
        window.uiTweener.update(dt);
    }
};

// 수동으로 플레이어 카메라 설정 (디버그/테스트용)
Bootstrap.prototype.setupPlayerCamera = function() {
    if (!window.gameManager || !window.cameraManager) {
        console.warn('[Bootstrap] GameManager or CameraManager not available');
        return;
    }

    if (window.gameManager.playerEntityID === -1) {
        console.warn('[Bootstrap] Player entity ID not set');
        return;
    }

    const playerEntity = window.gameManager.getEntity(window.gameManager.playerEntityID);
    if (playerEntity) {
        window.cameraManager.setTarget(playerEntity);
        window.cameraManager.startFollowing();
        console.log('[Bootstrap] Manual camera setup completed for player');
    } else {
        console.warn('[Bootstrap] Player entity not found');
    }
};