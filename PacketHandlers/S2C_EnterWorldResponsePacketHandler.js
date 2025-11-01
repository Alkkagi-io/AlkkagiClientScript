(function (root) {
    class S2C_EnterWorldResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            this.gameManager.playerEntityID = packet.entityID;
            for (const worldPlayerData of packet.worldPlayerData) {
                this.gameManager.handleAddPlayer(worldPlayerData);
            }
        }
    }

    root.S2C_EnterWorldResponsePacketHandler = S2C_EnterWorldResponsePacketHandler;
})(window); 