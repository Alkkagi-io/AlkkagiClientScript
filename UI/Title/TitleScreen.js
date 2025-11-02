var TitleScreen = pc.createScript('titleScreen');

TitleScreen.attributes.add('inputField', {
    type: 'entity'
});

TitleScreen.attributes.add('enterBtn', {
    type: 'entity'
});

TitleScreen.prototype.postInitialize = function() {
    uiManager.addScreen('title', this.entity);
    this.entity.enabled = false;

    const inputField = this.inputField.script.nameInputField;
    inputField.getEvents().on('onEnter', this.onEnter, this);

    this.enterBtn.button.on('click', event => {
        const text = inputField.input.value;
        this.onEnter(text);
    });
}

TitleScreen.prototype.onEnter = function(text) {
    gameManager.enterGame(text);
}