const CharacterEntityComponent = pc.createScript('characterEntityComponent');

CharacterEntityComponent.prototype.initialize = function() {
    const rigidbody = this.entity.rigidbody;
    rigidbody.on('triggerenter', this.onTriggerEnter.bind(this));
    rigidbody.on('collisionstart', this.onCollisionStart.bind(this));
};

CharacterEntityComponent.prototype.onTriggerEnter = function(entity) {
    const soundComponent = entity.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};

CharacterEntityComponent.prototype.onCollisionStart = function(result) {
    const soundComponent = result.other.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};