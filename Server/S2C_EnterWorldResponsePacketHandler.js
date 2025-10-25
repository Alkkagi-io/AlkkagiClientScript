function S2C_EnterWorldResponsePacketHandler(app, network) {
    this.app = app;
    this.network = network;
}
S2C_EnterWorldResponsePacketHandler.prototype.handle = function (packet) {
    this.network.playerEntityId = packet.entityID;
    console.log('[S2C_EnterWorldResponse]', packet.entityID);

    window.setPlayerHandler = true;
};
window.S2C_EnterWorldResponsePacketHandler = S2C_EnterWorldResponsePacketHandler;