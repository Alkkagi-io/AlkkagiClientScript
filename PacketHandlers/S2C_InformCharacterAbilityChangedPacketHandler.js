(function (root) {
    class S2C_InformCharacterAbilityChangedPacketHandler extends ClientPacketHandler {
        handle(packet) {
            const targetCharacterEntity = this.gameManager.getEntity(packet.entityID);
            if(targetCharacterEntity == null) {
                return;
            }

            targetCharacterEntity.script.characterEntityComponent.handleAbilityChanged(packet.abilityID);
            if(packet.entityID == this.gameManager.playerEntityID) {
                targetCharacterEntity.script.myPlayerComponent.handleAbilityChanged(packet.abilityID);
            }
        }
    }

    root.S2C_InformCharacterAbilityChangedPacketHandler = S2C_InformCharacterAbilityChangedPacketHandler;
})(window);