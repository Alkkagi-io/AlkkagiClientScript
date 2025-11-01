(function (root) {
    class Define {
        constructor() {
            throw new Error("Define is a static class and cannot be instantiated");
        }

        // local
        static CDN_ADDRESS = 'http://localhost:3000/data';
        static SHARED_BUNDLE_ADDRESS = 'http://localhost:3000/sharedbundle';
        static WS_ADDRESS = 'ws://localhost:3000/ws';
        
        // dev
        // static CDN_ADDRESS = 'https://alkkagidev.plasticpipe.tube/data';
        // static SHARED_BUNDLE_ADDRESS = 'https://alkkagidev.plasticpipe.tube/sharedbundle';
        // static WS_ADDRESS = 'wss://alkkagidev.plasticpipe.tube:9696/ws';
    }

    root.Define = Define;
})(window);