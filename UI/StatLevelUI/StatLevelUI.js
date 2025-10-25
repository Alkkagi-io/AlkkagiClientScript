var StatLevelUI = pc.createScript('statLevelUI');

StatLevelUI.attributes.add('elems', {
    type: 'entity',
    array: true
});

StatLevelUI.prototype.init = function() {
    for (const i = 0; i < this.elems.length; i++) {
        const elem = this.elems[i];
        elem.init(i + 1);
    }
};

StatLevelUI.prototype.handleLevelUpResponse = function(type, level) {
    const elem = this.elems[type];
    if (!elem)
        return;
    elem.reload(level);
};