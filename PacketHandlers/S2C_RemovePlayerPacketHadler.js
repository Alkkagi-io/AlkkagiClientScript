(function (root) {
    class S2C_RemovePlayerPacketHandler extends ClientPacketHandler {
        handle(packet) {
            this.gameManager.handleRemovePlayer(packet.removePlayerEntityID);
        }
    }

    root.S2C_RemovePlayerPacketHandler = S2C_RemovePlayerPacketHandler;
})(window); 