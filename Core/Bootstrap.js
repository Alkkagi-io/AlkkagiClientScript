const Bootstrap = pc.createScript('bootstrap');

Bootstrap.attributes.add('mainCamera', { type: 'entity' });
Bootstrap.attributes.add('entityTemplates', { type: 'asset', assetType: 'template', array: true });

Bootstrap.prototype.initialize = async function() {
    // SharedBundle 로드 전 먼저 등록
    window.uiManager = new UIManager();

    // AlkkagiSharedBundle이 로드될 때까지 대기
    while (window.AlkkagiSharedBundle == null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    await ResourceManager.initialize();
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.BotPlayer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.XPObject);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.XPContainer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.GoldContainer);
    this.RegisterFactory(AlkkagiSharedBundle.EEntityType.Player);
    
    // const networkOptions = createNetworkOptions({ address: 'wss://alkkagidev.plasticpipe.tube:9696/ws' });
    const networkOptions = createNetworkOptions({ address: 'ws://localhost:3000/ws' });
    const networkManager = new NetworkManager(networkOptions);
    networkManager.events.on('connected', this.onConnected.bind(this), this);

    window.gameManager = new GameManager(networkManager, this.mainCamera);

    buildPacketManager(window.gameManager, networkManager);

    networkManager.connect();
};

Bootstrap.prototype.onConnected = function() {
    window.gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_EnterWorldRequestPacket("myname"));
};

Bootstrap.prototype.RegisterFactory = function(type) {
    EntityFactory.on(type, this.entityTemplates[type - 1]);
};