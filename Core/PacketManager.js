(function (root) {
    function buildPacketManager(gameManager, networkManager) {

        const entityDataFactory = AlkkagiSharedBundle.EntityDataFactory;
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.XPObject, AlkkagiSharedBundle.XPObjectEntityStaticData, null);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.XPContainer, AlkkagiSharedBundle.XPContainerEntityStaticData, AlkkagiSharedBundle.DamagableEntityDynamicData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.GoldContainer, AlkkagiSharedBundle.StaticEntityStaticData, AlkkagiSharedBundle.DamagableEntityDynamicData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.Player, AlkkagiSharedBundle.CharacterEntityStaticData, AlkkagiSharedBundle.PlayerEntityDynamicData);
        entityDataFactory.on(AlkkagiSharedBundle.EEntityType.BotPlayer, AlkkagiSharedBundle.CharacterEntityStaticData, AlkkagiSharedBundle.CharacterEntityDynamicData);

        const packetManager = AlkkagiSharedBundle.PacketManager;
        packetManager.on(AlkkagiSharedBundle.EPacketID.Message, AlkkagiSharedBundle.MessagePacket, MessagePacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_UpdateWorld, AlkkagiSharedBundle.S2C_UpdateWorldPacket, S2C_UpdateWorldPacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_EnterWorldResponse, AlkkagiSharedBundle.S2C_EnterWorldResponsePacket, S2C_EnterWorldResponsePacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_CharacterLevelUp, AlkkagiSharedBundle.S2C_CharacterLevelUpPacket, S2C_CharacterLevelUpPacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_CharacterStatLevelUpResponse, AlkkagiSharedBundle.S2C_CharacterStatLevelUpResponsePacket, S2C_CharacterStatLevelUpResponsePacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_UpdateRankingPacket, AlkkagiSharedBundle.S2C_UpdateRankingPacket, S2C_UpdateRankingPacketHandler)
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_AddPlayerPacket, AlkkagiSharedBundle.S2C_AddPlayerPacket, S2C_AddPlayerPacketHandler);
        packetManager.on(AlkkagiSharedBundle.EPacketID.S2C_RemovePlayerPacket, AlkkagiSharedBundle.S2C_RemovePlayerPacket, S2C_RemovePlayerPacketHandler);

        packetManager.injectHandlerArgs(gameManager, networkManager);
    }

    root.buildPacketManager = buildPacketManager;
})(window);