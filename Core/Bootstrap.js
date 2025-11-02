const Bootstrap = pc.createScript('bootstrap');

Bootstrap.attributes.add('mainCamera', { type: 'entity' });
Bootstrap.attributes.add('entityTemplates', { type: 'asset', assetType: 'template', array: true });

Bootstrap.attributes.add('ingameUISoundTable', {
    type: 'json',
    array: true,
    schema: [
        { name: 'soundSlot', type: 'string' },
        { name: 'soundIndex', type: 'number' }
    ]
});

Bootstrap.attributes.add('ingameUISoundLibrary', {
    type: 'asset',
    assetType: 'audio',
    array: true
});

Bootstrap.prototype.initialize = async function() {
    const ingameUISoundMap = new Map();
    this.ingameUISoundTable.forEach(soundTableRow => {
        if(soundTableRow.soundIndex < 0 || soundTableRow.soundIndex >= this.ingameUISoundLibrary.length) {
            return;
        }

        const soundAsset = this.ingameUISoundLibrary[soundTableRow.soundIndex];
        if(soundAsset == null) {
            return;
        }

        ingameUISoundMap.set(soundTableRow.soundSlot, soundAsset);
    });

    // SharedBundle 로드 전 먼저 등록
    window.uiManager = new UIManager(ingameUISoundMap);

    await SharedCodeLoader.initialize();
    await ResourceManager.initialize();
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.BotPlayer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.XPObject);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.XPContainer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.GoldContainer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.Player);
    
    const networkOptions = createNetworkOptions({ address: Define.WS_ADDRESS });
    const networkManager = new NetworkManager(networkOptions);
    networkManager.events.on('connected', this.onConnected, this);

    window.gameManager = new GameManager(networkManager, this.mainCamera);

    // CameraManager 초기화
    // this.initializeCameraManager();

    buildPacketManager(window.gameManager, networkManager);

    networkManager.connect();
};

Bootstrap.prototype.onConnected = function() {
    uiManager.showScreen('title');
};

Bootstrap.prototype.RegisterFactory = function(type) {
    EntityFactory.on(type, this.entityTemplates[type - 1]);
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
            offset: { x: 0, y: 10, z: -15 }
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