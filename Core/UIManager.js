(function (root) {
    class UIManager {
        constructor(uiSoundMap) {
            this.screens = {};
            this._uiSoundMap = uiSoundMap;
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
    }

    root.UIManager = UIManager;
})(window);