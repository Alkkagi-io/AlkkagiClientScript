(function (root) {
    function createNetworkOptions(options = {}) {
        return {
            address: options.address || 'ws://localhost:3000'
        }
    }

    class NetworkManager {
        constructor(options) {
            this.events = new EventEmitter();
            this.options = options;
            this.socket = null;
        }

        connect() {
            if (this.socket) {
                if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
                    console.warn('[NetworkManager] Already connected/connecting');
                    return;
                }
            }

            this.socket = new WebSocket(this.options.address);
            this.socket.binaryType = 'arraybuffer';

            this.socket.onopen = function () {
                console.log('[NetworkManager] Connected:', this.options.address);
                this.events.emit('connected');
            }.bind(this);

            this.socket.onmessage = function (event) {
                try {
                    const readHandle = new AlkkagiSharedBundle.BufferReadHandle(event.data);
                    const packetID = readHandle.readUint8();

                    try {
                        const packet = AlkkagiSharedBundle.PacketManager.createPacket(packetID, event.data);
                        const handler = AlkkagiSharedBundle.PacketManager.createHandler(packetID);
                        handler.handle(packet);
                    } catch (error) {
                        console.error('[NetworkManager] Packet handle error:', error.stack);
                    }
                } catch (error) {
                    console.error('[NetworkManager] Packet parse error:', error.message);
                }
            }.bind(this);

            this.socket.onclose = function () {
                console.error('[NetworkManager] Disconnected');
                this.events.emit('disconnected');
            }.bind(this);

            this.socket.onerror = function (error) {
                console.error('[NetworkManager] Error:', error);
                this.events.emit('error', error);
            }.bind(this);
        }

        disconnect() {
            if (this.socket == null) {
                return;
            }

            this.socket.close();
            this.socket = null;
        }

        send(data) {
            if (this.socket == null || this.socket.readyState !== WebSocket.OPEN) {
                console.warn('[NetworkManager] Cannot send, socket not open');
                return;
            }

            let buffer = undefined;
            if (data instanceof AlkkagiSharedBundle.Packet)
                buffer = data.serialize();
            else if (data instanceof ArrayBuffer)
                buffer = data;

            if (buffer === undefined)
                throw new Error(`data is of invalid type. type : ${typeof (data)}`);

            this.socket.send(buffer, { binary: true });
        }
    }

    root.createNetworkOptions = createNetworkOptions;
    root.NetworkManager = NetworkManager;
})(window);

NetworkManager.prototype.getAllEntities = function () {
    return this.entities;
};