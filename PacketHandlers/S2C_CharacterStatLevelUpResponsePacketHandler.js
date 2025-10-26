(function (root) {
    class S2C_CharacterStatLevelUpResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            const playerEntityID = packet.entityID;
            if(playerEntityID == -1) {
                return;
            }

            const playerEntity = this.gameManager.getEntity(playerEntityID);
            if(playerEntity == null) {
                return;
            }

            
        }
    }

    root.S2C_CharacterStatLevelUpResponsePacketHandler = S2C_CharacterStatLevelUpResponsePacketHandler;
})(window);