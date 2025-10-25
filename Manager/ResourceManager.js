var ResourceManager = pc.createScript('resourceManager');

ResourceManager.prototype.initialize = function() {
    _getJsonData('StatLevelUps.json')
        .then(data => {
            window.AlkkagiSharedBundle.ResourceStatLevelUp.load(data);
        });

    _getJsonData('ShopItems.json')   
        .then(data => {
            window.AlkkagiSharedBundle.ResourceShopItem.load(data);
        });

    _getJsonData('CharacterLevels.json')   
        .then(data => {
            window.AlkkagiSharedBundle.ResourceCharacterLevel.load(data);
        });
    
    this.initialized = true;
};

async function _getJsonData(fileName) {
    const path = `https://cdn.jsdelivr.net/gh/Alkkagi-io/AlkkagiData@main/${fileName}`;
    const res = await fetch(path);
    const json = await res.json();
    return JSON.stringify(json);
}