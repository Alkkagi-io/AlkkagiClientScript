(function (root) {
    class S2C_CharacterLevelUpPacketHandler extends ClientPacketHandler {
        handle(packet) {
            const playerEntityID = packet.entityID;
            if(playerEntityID == -1) {
                return;
            }

            const playerEntity = this.gameManager.getEntity(playerEntityID);
            if(playerEntity == null) {
                return;
            }

            playerEntity.script.myPlayerComponent.handleLevelUp(packet.currentStatPoint);
        }
    }

    root.S2C_CharacterLevelUpPacketHandler = S2C_CharacterLevelUpPacketHandler;
})(window);