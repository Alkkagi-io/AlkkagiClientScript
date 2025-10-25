const Bootstrap = pc.createScript('bootstrap');

Bootstrap.attributes.add('entityTemplate', { type: 'asset', assetType: 'template' });

Bootstrap.prototype.initialize = async function() {
    // AlkkagiSharedBundle이 로드될 때까지 대기
    while (window.AlkkagiSharedBundle == null) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    await ResourceManager.initialize();

    EntityFactory.on(AlkkagiSharedBundle.EEntityType.Character, this.entityTemplate);
    EntityFactory.on(AlkkagiSharedBundle.EEntityType.XPObject, this.entityTemplate);
    EntityFactory.on(AlkkagiSharedBundle.EEntityType.XPContainer, this.entityTemplate);
    EntityFactory.on(AlkkagiSharedBundle.EEntityType.GoldContainer, this.entityTemplate);
    
    // const networkOptions = createNetworkOptions({ address: 'wss://alkkagidev.plasticpipe.tube:9696/ws' });
    const networkOptions = createNetworkOptions({ address: 'ws://localhost:3000/ws' });
    const networkManager = new NetworkManager(networkOptions);
    networkManager.on('connected', this.onConnected.bind(this), this);

    window.gameManager = new GameManager(networkManager);

    buildPacketManager(window.gameManager, networkManager);

    networkManager.connect();
};

Bootstrap.prototype.onConnected = function() {
    window.gameManager.networkManager.send(new AlkkagiSharedBundle.C2S_EnterWorldRequestPacket("myname"));
};