(function (root) {
    class S2C_AddPlayerPacketHandler extends ClientPacketHandler {
        handle(packet) {
            this.gameManager.handleAddPlayer(packet.addPlayerData);
        }
    }

    root.S2C_AddPlayerPacketHandler = S2C_AddPlayerPacketHandler;
})(window); 