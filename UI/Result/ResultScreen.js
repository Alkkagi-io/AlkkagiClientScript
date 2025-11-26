var ResultScreen = pc.createScript('resultScreen');

ResultScreen.attributes.add('killby', {
    type: 'entity'
});

ResultScreen.attributes.add('stats', {
    type: 'entity'
});

ResultScreen.attributes.add('restartBtn', {
    type: 'entity'
});

ResultScreen.attributes.add('isMobile', {
    type: 'boolean'
});

ResultScreen.prototype.postInitialize = function() {
    uiManager.addScreen('result', this, this.isMobile);
    this.restartBtn.button.off('click');
    this.restartBtn.button.on('click', event => {
        this.onClickRestart();
        uiManager.playUISound('default_button_click');
    });
    this.entity.enabled = false;
}

ResultScreen.prototype.show = function(killer, myData) {
    const killerData = killer ? gameManager.getWorldData(killer.script.entityComponent.entityStaticData.entityID) : null;
    this.killby.element.text = `다음에 의해 죽음\n<${killerData ? killerData.name : "???"}>`;

    this.stats.element.text = `최종 점수 - ${myData.score}\n레벨 - ${myData.level}`;

    this.restartBtn.button.active = true;
}

ResultScreen.prototype.onClickRestart = function() {
    gameManager.restart();
    this.restartBtn.button.active = false;
}