(function (root) {
    class S2C_EnterWorldResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            this.gameManager.playerEntityID = packet.entityID;
        }
    }

    root.S2C_EnterWorldResponsePacketHandler = S2C_EnterWorldResponsePacketHandler;
})(window);