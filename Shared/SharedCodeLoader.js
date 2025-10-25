var SharedCodeLoader = pc.createScript('sharedCodeLoader');

SharedCodeLoader.prototype.initialize = function() {
    var script = document.createElement('script');
    // script.type = 'module';

    script.onload = function() {
        console.log('shared code loader script loaded and ready!');
    };

    script.src = "https://cdn.jsdelivr.net/gh/Alkkagi-io/AlkkagiShared@main/Output/SharedBundle.js";
    document.getElementsByTagName('head')[0].appendChild(script);
};