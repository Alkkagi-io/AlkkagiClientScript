var TitleScreen = pc.createScript('titleScreen');

TitleScreen.prototype.postInitialize = function() {
    uiManager.addScreen('title', this.entity);
    this.entity.enabled = false;
}