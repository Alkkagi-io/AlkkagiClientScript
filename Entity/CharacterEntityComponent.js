const CharacterEntityComponent = pc.createScript('characterEntityComponent');

const SCALE_THRESHOLD = 0.05;

CharacterEntityComponent.prototype.initialize = function() {
    this.nameText = this.entity.findByName('nameText');

    const entityComponent = this.entity.script.entityComponent;
    entityComponent.getEvents().on('entityInitialized', this.onEntityInitialized, this);
    entityComponent.getEvents().on('entityUpdated', this.onEntityUpdated, this);

    const rigidbody = this.entity.rigidbody;
    rigidbody.on('triggerenter', this.onTriggerEnter, this);
    rigidbody.on('collisionstart', this.onCollisionStart, this);

    this.isDead = false;
};

CharacterEntityComponent.prototype.getEvents = function() {
    this.events ??= new EventEmitter();
    return this.events;
};

CharacterEntityComponent.prototype.onEntityInitialized = function(entityStaticData) {
    const scale = entityStaticData.scale;
    this.entity.setLocalScale(scale, scale, scale);
    this.entityStaticData = entityStaticData;

    if (this.nameText) {
        const worldData = gameManager.getWorldData(entityStaticData.entityID);
        this.nameText.enabled = false;

        if (worldData) {
            this.nameText.element.text = worldData.name;
        }
    }
}

CharacterEntityComponent.prototype.onEntityUpdated = function(elapsedMS, prevEntityDynamicData, entityDynamicData) {
    if(this.isDead) {
        return;
    }

    if (this.nameText && !this.nameText.enabled) {
        const worldData = gameManager.getWorldData(this.entityStaticData.entityID);
        
        if (worldData) {
            this.nameText.enabled = true;
            this.nameText.element.text = worldData.name;
        }
    }

    const curScale = this.entity.getLocalScale().x;
    if (Math.abs(entityDynamicData.scale - curScale) > SCALE_THRESHOLD) {
        const scale = entityDynamicData.scale;
        this.entity.setLocalScale(scale, scale, scale);
        this.entity.collision.radius = scale + 0.1;
    }

    if(entityDynamicData.hpPer / 100 > 0) {
        return;
    }

    this._die();
}

CharacterEntityComponent.prototype.onTriggerEnter = function(entity) {
    const soundComponent = entity.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};

CharacterEntityComponent.prototype.onCollisionStart = function(result) {
    this.lastCollisionEntity = result.other;

    const soundComponent = result.other.script.entitySoundComponent;
    soundComponent?.playSound('collision');
};

CharacterEntityComponent.prototype._die = function() {
    this.isDead = true;

    const soundComponent = this.entity.script.entitySoundComponent;
    soundComponent?.playSound('dead');

    setTimeout(() => {
        this.getEvents().emit('onDie', this.lastCollisionEntity);
    }, 1000);

    // 필요시 연출 추가
    // 직접적으로 destroy를 호출해선 안 된다.
}

CharacterEntityComponent.prototype.handleAbilityChanged = function(abilityID) {
    console.log(`handleAbilityChanged: ${abilityID}`);
};