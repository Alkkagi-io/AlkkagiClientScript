(function (root) {
    class S2C_UpdateWorldPacketHandler extends ClientPacketHandler {
        handle(packet) {
            packet.entityDatas.forEach(entityData => {
                const entity = this.gameManager.getOrCreateEntity(entityData);
                entity.script.entityComponent.updateEntityData(packet.elapsedMS, entityData);
                if (entity.script.myPlayerComponent) {
                    entity.script.myPlayerComponent.handleUpdateEntityData();
                }
            });

            this.gameManager.clear();
        }
    }

    root.S2C_UpdateWorldPacketHandler = S2C_UpdateWorldPacketHandler;
})(window);