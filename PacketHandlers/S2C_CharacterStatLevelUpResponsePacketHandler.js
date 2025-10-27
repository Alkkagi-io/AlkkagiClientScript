(function (root) {
    class S2C_CharacterStatLevelUpResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            const playerEntity = this.gameManager.getEntity(gameManager.playerEntityID);
            if(playerEntity == null) {
                return;
            }

            playerEntity.script.myPlayerComponent.handleStatLevelUp(packet.statType, packet.statLevel, packet.statPoint);
        }
    }

    root.S2C_CharacterStatLevelUpResponsePacketHandler = S2C_CharacterStatLevelUpResponsePacketHandler;
})(window);