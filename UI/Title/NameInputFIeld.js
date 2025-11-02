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
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.placeholder = '닉네임을 입력해주세요.';
    this.input.style.position = 'absolute';
    this.input.style.left = '50%';
    this.input.style.top = '60%';
    this.input.style.transform = 'translate(-50%, -50%)';
    this.input.style.width = '400px';
    this.input.style.padding = '6px 10px';
    this.input.style.fontSize = '16px';
    this.input.style.textAlign = 'center'; 
    this.input.style.color = '#000'; 
    this.input.style.zIndex = 9999;
    this.input.style.background = '#fff';
    this.input.style.border = '2px solid #1e1e1eff';
    this.input.style.borderRadius = '4px';

    document.body.appendChild(this.input);

    this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const text = this.input.value;
            this.getEvents().emit('onEnter', text);
        }
    });
};

NameInputField.prototype.onDisable = function () {
    if (this.input && this.input.parentNode) {
        this.input.parentNode.removeChild(this.input);
    }
};
