(function (root) {
    class GameManager /* extends EventEmitter */ {
        constructor(networkManager) {
            // super();
            this.networkManager = networkManager;
            this.playerEntityID = -1;

            this._entities = {};
            this._dirtiedEntityIDs = new Set();

        }

        getEntity(entityID) {
            return this._entities[entityID];
        }

        getOrCreateEntity(entityData) {
            let entity = this._entities[entityData.entityID];
            if(entity == null) {
                entity = EntityFactory.createEntity(entityData); 
                this._entities[entityData.entityID] = entity;
            }

            this._dirtiedEntityIDs.add(entityData.entityID);
            return entity;
        }

        clear() {
            Object.values(this._entities).forEach(entity => {
                const entityComponent = entity.script.entityComponent;
                const entityID = entityComponent.entityData.entityID;
                if(this._dirtiedEntityIDs.has(entityID)) {
                    return;
                }

                entity.destroy();
                delete this._entities[entityID];
            });

            this._dirtiedEntityIDs.clear();
        }
    }

    root.GameManager = GameManager;
})(window);