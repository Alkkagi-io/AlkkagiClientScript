(function (root) {
    class S2C_InteractAbilityEvolutionContainerResponsePacketHandler extends ClientPacketHandler {
        handle(packet) {
            const playerEntity = this.gameManager.getEntity(gameManager.playerEntityID);
            if(playerEntity == null) {
                return;
            }

            playerEntity.script.myPlayerComponent.handleGoldChanged(packet.ownGold);
        }
    }

    root.S2C_InteractAbilityEvolutionContainerResponsePacketHandler = S2C_InteractAbilityEvolutionContainerResponsePacketHandler;
})(window);