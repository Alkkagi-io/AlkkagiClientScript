(function (root) {
    class GameManager /* extends EventEmitter */ {
        constructor(networkManager) {
            // super();
            this.networkManager = networkManager;
            this.playerEntityID = -1;

            this._entities = new Map();
            this._worldPlayerData = new Map();
            this._dirtiedEntityIDs = new Set();
        }

        handleAddPlayer(worldPlayerData) {
            this._worldPlayerData.set(worldPlayerData.entityID, worldPlayerData);
        }

        handleRemovePlayer(playerId) {
            this._worldPlayerData.delete(playerId);
        }

        createEntity(entityStaticData) {
            if(this._entities.has(entityStaticData.entityID)) {
                return;
            }

            const entity = EntityFactory.createEntity(entityStaticData); 
            this._entities.set(entityStaticData.entityID, entity);
        }

        getEntity(entityID) {
            return this._entities.get(entityID);
        }

        getWorldData(entityId) {
            return this._worldPlayerData.get(entityId);
        }

        removeEntity(entityID) {
            const entity = this._entities.get(entityID);
            if(entity == null) {
                return;
            }

            entity.destroy();
            this._entities.delete(entityID);
        }
    }

    root.GameManager = GameManager;
})(window);