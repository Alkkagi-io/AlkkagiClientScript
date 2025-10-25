var RankElement = pc.createScript('RankElement');

RankElement.attributes.add('text', {
    type: 'entity'
});

RankElement.prototype.initialize = function() {
    this.set('-');
};

RankElement.prototype.set = function(text) {
    this.text.element.text = text;
};