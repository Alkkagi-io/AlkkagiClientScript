(function (root) {
    class GameManager /* extends EventEmitter */ {
        constructor(networkManager, mainCamera) {
            // super();
            this.networkManager = networkManager;
            this.mainCamera = mainCamera;
            this.playerEntityID = -1;

            this._entities = new Map();
            this._dirtiedEntityIDs = new Set();
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