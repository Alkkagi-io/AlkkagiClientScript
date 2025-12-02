var ControlNotiPopup = pc.createScript('controlNotiPopup');

ControlNotiPopup.prototype.show = function(isMobile) {
    this.entity.setLocalScale(0, 0, 0);
    this.time = 5;
    this.isMobile = isMobile;
    this.active = false;
    this.entity.enabled = true;
    uiTweener.doScale(this.entity, 1, 1, 0.5, ()=>this.active = true, Easing.easeOutBounce);
}

ControlNotiPopup.prototype.update = function(dt) {
    if (!this.active)
        return;

    if (this.isMobile)
        return;

    this.time -= dt;
    if (this.time <= 0) {
        this.close();
    }
}

ControlNotiPopup.prototype.close = function() {
    this.active = false;
    uiTweener.doScale(this.entity, 0, 0, 0.5, ()=>this.entity.enabled = false, Easing.easeInBounce);
}