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
            const path = `https://cdn.jsdelivr.net/gh/Alkkagi-io/AlkkagiData@main/${fileName}`;
            const res = await fetch(path);
            const json = await res.json();
            return JSON.stringify(json);
        }
    }

    root.ResourceManager = ResourceManager;
})(window);