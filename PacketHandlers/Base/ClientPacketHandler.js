(function (root) {
    class PacketHandler {
        constructor() {
        }
    
        handle(packet) {
            throw new Error("Abstract method 'handle' must be implemented");
        }
    }

    class ClientPacketHandler extends PacketHandler {
        constructor(gameManager, networkManager) {
            super();
            this.gameManager = gameManager;
            this.networkManager = networkManager;
        }
        
        handle(packet) {
            super.handle(packet);
        }
    }

    root.ClientPacketHandler = ClientPacketHandler;
})(window);