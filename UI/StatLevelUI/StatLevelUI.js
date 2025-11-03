var StatLevelUI = pc.createScript('statLevelUI');

StatLevelUI.attributes.add('statPointText', {
    type: 'entity'
})

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

StatLevelUI.prototype.handleUpdateLevelPoint = function(point) {
    this.statPointText.enabled = point > 0;
    this.statPointText.element.text = `+${point}`;
};

StatLevelUI.prototype.handleLevelUpResponse = function(type, level) {
    const elem = this.elems[type - 1].script.statLevelElementUI;
    if (!elem)
        return;
    elem.reload(level);
};