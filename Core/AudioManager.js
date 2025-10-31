(function (root) {
    class AudioManager {
        constructor() {
            throw new Error('AudioManager is a static class and cannot be instantiated');
        }

        static playSound(soundAsset, volume) {
            if(soundAsset == null || soundAsset.resource == null) {
                return;
            }

            const app = root.pc.Application.getApplication();
            const instance = new pc.SoundInstance(app.systems.sound.manager, soundAsset.resource, {
                volume: volume
            });
            instance.play();

            return instance;
        }
    }

    root.AudioManager = AudioManager;
})(window);