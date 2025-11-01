const Bootstrap = pc.createScript('bootstrap');

Bootstrap.attributes.add('mainCamera', { type: 'entity' });
Bootstrap.attributes.add('entityTemplates', { type: 'asset', assetType: 'template', array: true });

Bootstrap.attributes.add('uiSoundTable', {
    type: 'json',
    array: true,
    schema: [
        { name: 'soundSlot', type: 'string' },
        { name: 'soundIndex', type: 'number' }
    ]
});

Bootstrap.attributes.add('uiSoundLibrary', {
    type: 'asset',
    assetType: 'audio',
    array: true
});

Bootstrap.prototype.initialize = async function() {
    const uiSoundMap = new Map();
    this.uiSoundTable.forEach(soundTableRow => {
        if(soundTableRow.soundIndex < 0 || soundTableRow.soundIndex >= this.uiSoundLibrary.length) {
            return;
        }

        const soundAsset = this.uiSoundLibrary[soundTableRow.soundIndex];
        if(soundAsset == null) {
            return;
        }

        uiSoundMap.set(soundTableRow.soundSlot, soundAsset);
    });

    // SharedBundle 로드 전 먼저 등록
    window.uiManager = new UIManager(uiSoundMap);

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

    buildPacketManager(window.gameManager, networkManager);

    networkManager.connect();
};

Bootstrap.prototype.onConnected = function() {
    gameManager.myname = "myname";
    window.gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_EnterWorldRequestPacket(gameManager.myname));
};

Bootstrap.prototype.RegisterFactory = function(type) {
    EntityFactory.on(type, this.entityTemplates[type - 1]);
};