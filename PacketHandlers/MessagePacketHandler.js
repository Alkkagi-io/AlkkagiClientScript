(function (root) {
    class MessagePacketHandler extends ClientPacketHandler {
        handle(packet) {
            console.log('[Message]', packet.message);
        }
    }

    root.MessagePacketHandler = MessagePacketHandler;
})(window);