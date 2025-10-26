(function (root) {
    class UIManager {
        constructor() {
            this.screens = {};
        }

        // type: title, ingame, result
        addScreen(type, screenEntity) {
            this.screens[type] = screenEntity;
        }

        getScreen(type) {
            return this.screens[type];
        }
    }

    root.UIManager = UIManager;
})(window);