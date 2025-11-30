(function (root) {
    class GameManager /* extends EventEmitter */ {
        constructor(networkManager, mainCamera) {
            // super();
            this.networkManager = networkManager;
            this.mainCamera = mainCamera;
            this.playerEntityID = -1;

            this._entities = new Map();
            this._worldPlayerData = new Map();
            this._dirtiedEntityIDs = new Set();
        }

        enterGame(name) {
            if (!name || name.length === 0) {
                uiManager.showToastPopup('닉네임을 입력해주세요.', 1.5);
                return false;
            }

            if (name.length > 8) {
                uiManager.showToastPopup('닉네임은 최대 8글자까지\n입력 가능합니다.', 1.5);
                return false;
            }

            this.myname = name;
            this.networkManager.send(new AlkkagiSharedBundle.C2S_EnterWorldRequestPacket(this.myname, pc.platform.mobile));

            return true;
        }

        restart() {
            this.networkManager.send(new AlkkagiSharedBundle.C2S_EnterWorldRequestPacket(this.myname, pc.platform.mobile));
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