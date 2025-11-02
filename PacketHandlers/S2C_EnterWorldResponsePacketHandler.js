(function (root) {
    class S2C_EnterWorldResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            this.gameManager.playerEntityID = packet.entityID;
            for (const worldPlayerData of packet.worldPlayerData) {
                this.gameManager.handleAddPlayer(worldPlayerData);
            }

            this.gameManager.mainCamera.camera.projection = pc.PROJECTION_ORTHOGRAPHIC;
            this.gameManager.mainCamera.camera.orthoHeight = packet.viewSize.y;
        }
    }

    root.S2C_EnterWorldResponsePacketHandler = S2C_EnterWorldResponsePacketHandler;
})(window); 