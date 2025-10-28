var DynamicGaugeElement = pc.createScript('dynamicGaugeElement');

DynamicGaugeElement.attributes.add('maxValue', {
    type: 'number'
});

DynamicGaugeElement.attributes.add('offset', {
    type: 'number'
});

DynamicGaugeElement.attributes.add('gaugeEntityName', {
    type: 'string'
});

DynamicGaugeElement.attributes.add('textEntityname', {
    type: 'string'
});

DynamicGaugeElement.prototype.initialize = function() {
    this.gauge = this.entity.findByName(this.gaugeEntityName);
    this.text = this.entity.findByName(this.textEntityName);
}

DynamicGaugeElement.prototype.setGauge = function(value) {
    if (!this.gauge)
        return; 

    this.gauge.setLocalScale((value - this.offset) / this.maxValue, 1, 1);
};

DynamicGaugeElement.prototype.setText = function(value) {
    if (!this.text || !this.text.element)
        return;

    this.text.element.text = value;
};