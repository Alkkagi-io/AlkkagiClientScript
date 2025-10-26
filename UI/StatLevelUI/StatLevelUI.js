var StatLevelUI = pc.createScript('statLevelUI');

StatLevelUI.attributes.add('elems', {
    type: 'entity',
    array: true
});

StatLevelUI.prototype.init = function() {
    for (let i = 0; i < this.elems.length; i++) {
        const elem = this.elems[i].script.statLevelElementUI;
        elem.init(i + 1);
    }
};

StatLevelUI.prototype.handleLevelUpResponse = function(type, level) {
    const elem = this.elems[type].script.statLevelElementUI;
    if (!elem)
        return;
    elem.reload(level);
};