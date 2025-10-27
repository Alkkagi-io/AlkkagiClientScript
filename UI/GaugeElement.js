var GaugeElement = pc.createScript('GaugeElement');

GaugeElement.attributes.add('maxValue', {
    type: 'number'
});

GaugeElement.attributes.add('offset', {
    type: 'number'
});

GaugeElement.attributes.add('gauge', {
    type: 'entity'
});

GaugeElement.attributes.add('text', {
    type: 'entity'
});

GaugeElement.prototype.setGauge = function(value) {
    if (!this.gauge)
        return; 

    this.gauge.setLocalScale((value - this.offset) / this.maxValue, 1, 1);
};

GaugeElement.prototype.setText = function(value) {
    if (!this.text || !this.text.element)
        return;

    this.text.element.text = value;
};