(function (root) {
    class SharedCodeLoader {
        constructor() {
            throw new Error("SharedCodeLoader is a static class and cannot be instantiated");
        }

        static async initialize() {
            const script = document.createElement('script');
            script.src = Define.SHARED_BUNDLE_ADDRESS;
            document.getElementsByTagName('head')[0].appendChild(script);

            await new Promise(resolve => {
                script.onload = () => {
                    resolve();
                };
            });

            console.log('shared code loader script loaded and ready!');
        }
    }

    root.SharedCodeLoader = SharedCodeLoader;
})(window);