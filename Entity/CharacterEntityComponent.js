const CharacterEntityComponent = pc.createScript('characterEntityComponent');

const SCALE_THRESHOLD = 0.05;

CharacterEntityComponent.prototype.initialize = function() {
    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);

    const rigidbody = this.entity.rigidbody;
    rigidbody.on('triggerenter', this.onTriggerEnter, this);
    rigidbody.on('collisionstart', this.onCollisionStart, this);

    this.isDead = false;
};

CharacterEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const scale = entityStaticData.scale;
    this.entity.setLocalScale(scale, scale, scale);
}

CharacterEntityComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    if(this.isDead) {
        return;
    }

    const curScale = this.entity.getLocalScale().x;
    if (Math.abs(entityDynamicData.scale - curScale) > SCALE_THRESHOLD) {
        const scale = entityDynamicData.scale;
        this.entity.setLocalScale(scale, scale, scale);
    }

    if(entityDynamicData.hpPer / 100 > 0) {
        return;
    }

    this._die();
}

CharacterEntityComponent.prototype.onTriggerEnter = function(entity) {
    if(this.isDead) {
        return;
    }

    const soundComponent = entity.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};

CharacterEntityComponent.prototype.onCollisionStart = function(result) {
    if(this.isDead) {
        return;
    }

    const soundComponent = result.other.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};

CharacterEntityComponent.prototype._die = function() {
    this.isDead = true;

    const soundComponent = this.entity.script.entitySoundComponent;
    soundComponent?.playSound('dead');

    // 필요시 연출 추가
    // 직접적으로 destroy를 호출해선 안 된다.
}