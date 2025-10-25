(function (root) {
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