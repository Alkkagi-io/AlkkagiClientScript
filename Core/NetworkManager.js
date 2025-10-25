(function (root) {
    function createNetworkOptions(options = {}) {
        return {
            address : options.address || 'ws://localhost:3000'
        }
    }
})(window);

/* global pc */

// PlayCanvas script type: networkManager
var NetworkManager = pc.createScript('networkManager');
// createScript 아래에 추가
NetworkManager._instance = null;
// Attributes
NetworkManager.attributes.add('port', { type: 'number', default: 3000, title: 'Port' });
NetworkManager.attributes.add('path', { type: 'string', default: '', title: 'Path (optional, e.g. /ws)' });
NetworkManager.attributes.add('autoConnect', { type: 'boolean', default: true, title: 'Auto Connect' });
NetworkManager.attributes.add('nickname', { type: 'string', default: 'Guest', title: 'Nickname' });


// networkManager.js
NetworkManager.prototype.initialize = function () {
    // 싱글톤 가드
    if (NetworkManager._instance && NetworkManager._instance !== this) {
        console.warn('[NetworkManager] Another instance exists. Removing this one.');
        // 중복 인스턴스 제거
        try { this.entity.script.remove('networkManager'); } catch (e) { }
        return;
    }

    NetworkManager._instance = this;
    window.networkManager = this; // 전역 접근용

    this.ws = null;
    this.entities = new Map();
    if (window.__netRegistryReady) this._safeConnect();
    else this.app.once('net:registry-ready', this._safeConnect, this);
};

NetworkManager.prototype._safeConnect = function () {
    if (this.autoConnect) this.connect();
};


NetworkManager.prototype.getAllEntities = function () {
    return this.entities;
};


NetworkManager.prototype._buildUrl = function () {
    var path = this.path || '';
    if (path && path.charAt(0) !== '/') path = '/' + path;

    return 'ws://localhost:' + this.port + path;
};


NetworkManager.prototype.connect = function () {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        console.warn('[NetworkManager] Already connected/connecting');
        return;
    }

    var url = this._buildUrl();
    this.ws = new WebSocket(url);
    this.ws.binaryType = 'arraybuffer';

    var self = this;
    this.ws.onopen = function () {
        console.log('[NetworkManager] Connected:', url);

        if (this.ws && (this.ws.readyState !== WebSocket.OPEN)) {
            console.error('[NetworkManager] Already connected/connecting');
            return;
        }

        // var B = window.AlkkagiSharedBundle;
        // var c2sWorldEnterRequestPacket = new B.C2S_EnterWorldRequestPacket(nickName || 'Guest');
        // this.send(c2sWorldEnterRequestPacket.serialize());
        //     //this.requireToEnterWorld(self.nickName);
        // };
        this.ws.onclose = this.closedFromServer;
        this.ws.onerror = this.errorFromServer;
        // onmessage: 패킷 디스패치
        this.ws.onmessage = (ev) => {
            this._onMessage(ev.data);
        };
    };
}

    NetworkManager.prototype.requireToEnterWorld = function (nickName) {
        if (this.ws && (this.ws.readyState !== WebSocket.OPEN)) {
            console.error('[NetworkManager] Already connected/connecting');
            return;
        }

        var B = window.AlkkagiSharedBundle;
        var c2sWorldEnterRequestPacket = new B.C2S_EnterWorldRequestPacket(nickName || 'Guest');
        this.send(c2sWorldEnterRequestPacket.serialize());
    }

    NetworkManager.prototype.closedFromServer = function (ev) {
        console.error('[NetworkManager] Disconnected. code=', ev.code, 'reason=', ev.reason);
    }

    NetworkManager.prototype.errorFromServer = function (ev) {
        console.error('[NetworkManager] Disconnected. code=', ev.code, 'reason=', ev.reason);
    }

    NetworkManager.prototype._onMessage = function (data) {
        var B = window.AlkkagiSharedBundle;
        if (!B) return;

        try {
            var read = new B.BufferReadHandle(data);
            var id = read.readUint8();

            var packet = B.PacketManager.createPacket(id, data);
            var handler = B.PacketManager.createHandler(id, this.app, this);

            handler.handle(packet);
        } catch (e) {
            console.error('[NetworkManager] Handle packet failed:', e);
        }
    };

    // NetworkManager.js 어딘가에
    NetworkManager.prototype.getOrCreateEntity = function (id) {
        var e = this.entities.get(id);
        if (e) return e;

        e = new pc.Entity('unit-' + id);
        e.addComponent('model', { type: 'box' });
        e.setLocalScale(0.5, 0.5, 0.5);
        this.app.root.addChild(e);

        this.entities.set(id, e);
        return e;
    };


    NetworkManager.prototype.send = function (data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('[NetworkManager] Cannot send, socket not open');
            return;
        }
        if (data instanceof ArrayBuffer || typeof data === 'string' || data instanceof Blob) {
            this.ws.send(data);
        } else if (data && typeof data.serialize === 'function') {
            this.ws.send(data.serialize());
        } else {
            console.warn('[NetworkManager] Unsupported data type to send');
        }
    };

    NetworkManager.prototype.disconnect = function () {
        if (this.ws) {
            try { this.ws.close(); } catch (e) { }
            this.ws = null;
        }
    };