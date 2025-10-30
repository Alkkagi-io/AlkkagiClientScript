(function (root) {
    class S2C_UpdateWorldPacketHandler extends ClientPacketHandler {
        handle(packet) {

            packet.appearedEntityStaticDatas.forEach(entityStaticData => {
                this.gameManager.createEntity(entityStaticData);
            });

            packet.nearbyEntityDynamicDatas.forEach(entityDynamicData => {
                const entity = this.gameManager.getEntity(entityDynamicData.entityID);
                if(entity == null) {
                    return;
                }

                const entityComponent = entity.script.entityComponent;
                entityComponent?.updateEntityData(packet.elapsedMS, entityDynamicData);
            });

            packet.disappearedEntityIDs.forEach(entityID => {
                this.gameManager.removeEntity(entityID);
            });
        }
    }

    root.S2C_UpdateWorldPacketHandler = S2C_UpdateWorldPacketHandler;
})(window);