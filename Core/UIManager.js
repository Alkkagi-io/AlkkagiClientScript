(function (root) {
    class UIManager {
        constructor(uiSoundMap) {
            this.screens = {};
            this._uiSoundMap = uiSoundMap;
            this._currentScreen = null;
        }

        // type: title, ingame, result
        addScreen(type, screenEntity) {
            this.screens[type] = screenEntity;
        }

        getScreen(type) {
            return this.screens[type];
        }

        playUISound(soundSlot) {
            const soundAsset = this._uiSoundMap.get(soundSlot);
            AudioManager.playSound(soundAsset, 1);
        }

        showScreen(type) {
            if (this._currentScreen) {
                this._currentScreen.enabled = false;
                this._currentScreen = null;
            }

            this._currentScreen = this.getScreen(type);
            this._currentScreen.enabled = true;
            return this._currentScreen;
        }
    }

    root.UIManager = UIManager;
})(window);