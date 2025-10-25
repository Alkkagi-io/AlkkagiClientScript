(function (root) {
    class PacketHandler {
        constructor() {
        }
    
        handle(packet) {
            throw new Error("Abstract method 'handle' must be implemented");
        }
    }

    root.PacketHandler = PacketHandler;
})(window);