(function (root) {
    class EntityFactory {
        constructor() {
            throw new Error("EntityFactory is a static class and cannot be instantiated");
        }
    
        static on(entityType, entityTemplate) {
            this.entityFactories ??= { };
            this.entityFactories[entityType] = entityTemplate;
        }
    
        static createEntity(entityStaticData) {
            if(entityStaticData.entityType == AlkkagiSharedBundle.EEntityType.None) {
                throw new Error(`Entity type is not set`);
            }
    
            const factory = this.entityFactories[entityStaticData.entityType];
            if(factory == null) {
                throw new Error(`EntityFactory for entityType ${entityStaticData.entityType} not found`);
            }

            const entity = factory.resource.instantiate();
            const entityComponent = entity.script.entityComponent;
            entityComponent.entityStaticData = entityStaticData;

            const app = root.pc.Application.getApplication();
            app.root.addChild(entity);            

            return entity;
        }
    }

    root.EntityFactory = EntityFactory;
})(window);