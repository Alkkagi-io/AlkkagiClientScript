(function (root) {
    function buildPacketManager(bundle) {
        const packetManager = bundle.PacketManager;
        packetManager.on(bundle.EPacketID.Message, bundle.MessagePacket, MessagePacketHandler);
        packetManager.on(bundle.EPacketID.S2C_UpdateWorld, bundle.S2C_UpdateWorldPacket, S2C_UpdateWorldPacketHandler);
        packetManager.on(bundle.EPacketID.S2C_EnterWorldResponse, bundle.S2C_EnterWorldResponsePacket, S2C_EnterWorldResponsePacketHandler);
    }

    root.buildPacketManager = buildPacketManager;
})(window);