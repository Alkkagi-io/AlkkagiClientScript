var ToastPopup = pc.createScript('toastPopup');

ToastPopup.attributes.add('text', {
    type: 'entity'
});

ToastPopup.prototype.initialize = function() {
    uiManager.toastPopup = this;
    this.entity.enabled = false;
}

ToastPopup.prototype.show = function(text, time) {
    this.time = time;
    this.text.element.text = text;
    
    this.active = false;
    this.entity.enabled = true;

    this.entity.setLocalPosition(0, 300, 0);
    uiTweener.doMove(this.entity, 0, 80, 0.5, ()=>this.active = true, Easing.easeOutQuad);
};

ToastPopup.prototype.update = function(dt) {
    if (!this.active)
        return;

    this.time -= dt;
    if (this.time <= 0) {
        this.close();
    }
}

ToastPopup.prototype.close = function() {
    this.active = false;
    uiTweener.doMove(this.entity, 0, 300, 0.5, ()=>this.entity.enabled = false, Easing.easeInQuad);
}