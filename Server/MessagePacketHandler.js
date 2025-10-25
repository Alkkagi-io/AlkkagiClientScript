function MessagePacketHandler(app, network) {
    this.app = app; this.network = network;
}
MessagePacketHandler.prototype.handle = function (packet) {
    console.log('[Message]', packet.message);
};
window.MessagePacketHandler = MessagePacketHandler;
