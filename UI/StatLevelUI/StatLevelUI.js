var StatLevelUI = pc.createScript('statLevelUI');

StatLevelUI.prototype.postInitialize = function() {
    const resources = window.AlkkagiSharedBundle.ResourceStatLevelUp.getAll();
    console.log(JSON.stringify(resources));
};