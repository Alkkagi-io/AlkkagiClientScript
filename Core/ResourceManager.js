(function (root) {
    class ResourceManager {
        constructor() {
            throw new Error("ResourceManager is a static class and cannot be instantiated");
        }

        static async initialize() {
            await ResourceManager._getJsonData('StatLevelUps.json').then(data => AlkkagiSharedBundle.ResourceStatLevelUp.load(data));
            await ResourceManager._getJsonData('ShopItems.json').then(data => AlkkagiSharedBundle.ResourceShopItem.load(data));
            await ResourceManager._getJsonData('CharacterLevels.json').then(data => AlkkagiSharedBundle.ResourceCharacterLevel.load(data));
        }

        static async _getJsonData(fileName) {
            const path = `${Define.CDN_ADDRESS}/${fileName}`;
            const res = await fetch(path);
            if (res.ok == false) {
                uiManager.createBlockDiv('서버 점검 중입니다. 잠시 후 다시 시도해주세요.');
                return '{}';
            }

            const json = await res.json();
            return JSON.stringify(json);
        }
    }

    root.ResourceManager = ResourceManager;
})(window);