(function (root) {
    class S2C_CharacterLevelUpPacketHandler extends ClientPacketHandler {
        handle(packet) {
            const playerEntity = this.gameManager.getEntity(gameManager.playerEntityID);
            if(playerEntity == null) {
                return;
            }

            playerEntity.script.myPlayerComponent.handleLevelUp(packet.currentLevel, packet.currentStatPoint);
        }
    }

    root.S2C_CharacterLevelUpPacketHandler = S2C_CharacterLevelUpPacketHandler;
})(window);