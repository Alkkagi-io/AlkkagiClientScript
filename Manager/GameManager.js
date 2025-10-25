var GameManager = pc.createScript('gameManager');

// initialize code called once per entity
GameManager.prototype.initialize = function() {
    const nm = NetworkManager.get();

    // 네트워크 매니저가 아직 없을 수도 있으니 널 체크
    if (!nm) {
        // 레지스트리 준비 신호가 있을 때 다시 시도
        this.app.once('net:registry-ready', this._tryAutoEnter, this);
    } else {
        this._tryAutoEnter();
    }
};


GameManager.prototype._tryAutoEnter = function () {
    const nm = NetworkManager.get();
    if (!nm) return;

    if (this.autoEnter) {
        if (nm.isOpen()) {
            this.sendEnter();
        } else {
            this.app.once('net:open', this.sendEnter, this); // 열리면 보낸다
        }
    }
};

GameManager.prototype.sendEnter = function () {
    const B = window.AlkkagiSharedBundle;
    if (!B) return console.error('[EnterWorldSender] Shared bundle not loaded.');

    const pkt = new B.C2S_EnterWorldRequestPacket(this.nickname || 'Guest');
    NetworkManager.get().send(pkt); // 직통 전송
};


// update code called every frame
GameManager.prototype.update = function(dt) {
    
};

// uncomment the swap method to enable hot-reloading for this script
// update the method body to copy state from the old instance
// GameManager.prototype.swap = function(old) { };