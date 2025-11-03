var NameInputField = pc.createScript('nameInputField');

NameInputField.prototype.initialize = function () {
    this.on('state', enabled => {
        if (enabled) this.onEnable();
        else this.onDisable();
    });
};

NameInputField.prototype.getEvents = function() {
    this.events ??= new EventEmitter();
    return this.events;
};

NameInputField.prototype.onEnable = function () {
    const overlay = uiManager.overlayDiv;

    this.input = document.createElement('input');
    this.input.placeholder = '닉네임을 입력해주세요.';

    Object.assign(this.input.style, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, 50%)',
        width: '40%',
        height: '5%',
        maxWidth: '400px',
        fontSize: '140%',
        padding: '0.5% 1%',
        textAlign: 'center',
        color: '#000',
        background: '#fff',
        border: '2px solid #1e1e1e',
        borderRadius: '4px',
        pointerEvents: 'auto'
    });

    overlay.appendChild(this.input);

    // this.input.addEventListener('keydown', (e) => {
    //     if (e.key === 'Enter') {
    //         const text = this.input.value;
    //         this.getEvents().emit('onEnter', text);
    //     }
    // });
};

NameInputField.prototype.onDisable = function () {
    if (this.input && this.input.parentNode) {
        this.input.parentNode.removeChild(this.input);
    }
};
