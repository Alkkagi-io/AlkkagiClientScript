const EntitySoundComponent = pc.createScript('entitySoundComponent');

EntitySoundComponent.attributes.add('minDistance', {
    type: 'number',
    default: 2
});

EntitySoundComponent.attributes.add('maxDistance', {
    type: 'number',
    default: 1000
});

EntitySoundComponent.attributes.add('volume', {
    type: 'number',
    default: 1
});

EntitySoundComponent.attributes.add('soundTable', {
    type: 'json',
    array: true,
    schema: [
        { name: 'soundSlot', type: 'string' },
        { name: 'soundIndex', type: 'number' }
    ]
});

EntitySoundComponent.attributes.add('soundLibrary', {
    type: 'asset',
    assetType: 'audio',
    array: true
});

EntitySoundComponent.prototype.initialize = function() {
    this.soundMap = new Map();
    this.soundTable.forEach(soundTableRow => {
        if(this.soundMap.has(soundTableRow.soundSlot) == false) {
            this.soundMap.set(soundTableRow.soundSlot, []);
        }

        if(soundTableRow.soundIndex < 0 || soundTableRow.soundIndex >= this.soundLibrary.length) {
            return;
        }

        const soundAsset = this.soundLibrary[soundTableRow.soundIndex];
        if(soundAsset == null) {
            return;
        }

        this.soundMap.get(soundTableRow.soundSlot).push(soundAsset);
    });
};

EntitySoundComponent.prototype.playSound = function(soundSlot) {
    const sqrX = Math.pow(this.entity.getPosition().x - gameManager.mainCamera.getPosition().x, 2);
    const sqrY = Math.pow(this.entity.getPosition().y - gameManager.mainCamera.getPosition().y, 2);
    const distance2d = Math.sqrt(sqrX + sqrY);
    const volume2d = this.inverseAttenuation(distance2d, this.minDistance, this.maxDistance) * this.volume;
    // console.log(`sound slot: ${soundSlot}, distance2d: ${distance2d}, minDistance: ${this.minDistance}, maxDistance: ${this.maxDistance}, volume2d: ${volume2d}`);

    const soundAssets = this.soundMap.get(soundSlot);
    if(soundAssets == null || soundAssets.length == 0) {
        return;
    }

    const soundAsset = soundAssets[AlkkagiSharedBundle.Random.rangeInt(0, soundAssets.length)];
    AudioManager.playSound(soundAsset, volume2d);
};

EntitySoundComponent.prototype.inverseAttenuation = function(distance, minDistance, maxDistance) {
    const fixedDistance = Math.max(distance, minDistance);
    if(fixedDistance >= maxDistance) {
        return 0;
    }

    const attenuation = minDistance / fixedDistance;
    return attenuation;
};