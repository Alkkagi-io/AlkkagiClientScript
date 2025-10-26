(function (root) {
    function buildPacketManager(gameManager, networkManager) {

        const entityDataFactory = AlkkagiSharedBundle.EntityDataFactory;
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.Character, AlkkagiSharedBundle.CharacterEntityData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.XPObject, AlkkagiSharedBundle.XPObjectEntityData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.XPContainer, AlkkagiSharedBundle.XPContainerEntityData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.GoldContainer, AlkkagiSharedBundle.GoldContainerEntityData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.Player, AlkkagiSharedBundle.PlayerEntityData);

        const packetManager = AlkkagiSharedBundle.PacketManager;
        packetManager.on(AlkkagiSharedBundle.EPacketID.Message, AlkkagiSharedBundle.MessagePacket, MessagePacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_UpdateWorld, AlkkagiSharedBundle.S2C_UpdateWorldPacket, S2C_UpdateWorldPacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_EnterWorldResponse, AlkkagiSharedBundle.S2C_EnterWorldResponsePacket, S2C_EnterWorldResponsePacketHandler);

        packetManager.injectHandlerArgs(gameManager, networkManager);
    }

    root.buildPacketManager = buildPacketManager;
})(window);