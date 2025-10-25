(function (root) {
    class EntityFactory {
        constructor() {
            throw new Error("EntityFactory is a static class and cannot be instantiated");
        }
    
        static on(entityType, entityTemplate) {
            this.entityFactories ??= { };
            this.entityFactories[entityType] = entityTemplate;
        }
    
        static createEntity(entityData) {
            if(entityData.entityType == AlkkagiSharedBundle.EEntityType.None) {
                throw new Error(`Entity type is not set`);
            }
    
            const factory = this.entityFactories[entityData.entityType];
            if(factory == null) {
                throw new Error(`EntityFactory for entityType ${entityData.entityType} not found`);
            }

            const entity = factory.resource.instantiate();
            root.pc.Application.getApplication().root.addChild(entity);

            entity.script.entityComponent.initializeEntity(entityData);
            return entity;
        }
    }

    root.EntityFactory = EntityFactory;
})(window);