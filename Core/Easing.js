(function (root) {
    class Easing {
        constructor() {
            throw new Error("Easing is a static class and cannot be instantiated");
        }

        // 선형 (기본형)
        static linear(t) {
            return t;
        }

        // easeIn 계열 (천천히 시작)
        static easeInQuad(t) {
            return t * t;
        }

        static easeInCubic(t) {
            return t * t * t;
        }

        static easeInQuart(t) {
            return t * t * t * t;
        }

        static easeInQuint(t) {
            return t * t * t * t * t;
        }

        // easeOut 계열 (빠르게 시작 후 완만)
        static easeOutQuad(t) {
            return 1 - (1 - t) * (1 - t);
        }

        static easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        static easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        static easeOutQuint(t) {
            return 1 - Math.pow(1 - t, 5);
        }

        // easeInOut 계열 (양쪽에서 부드럽게)
        static easeInOutQuad(t) {
            return t < 0.5
                ? 2 * t * t
                : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        static easeInOutCubic(t) {
            return t < 0.5
                ? 4 * t * t * t
                : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        static easeInOutQuart(t) {
            return t < 0.5
                ? 8 * t * t * t * t
                : 1 - Math.pow(-2 * t + 2, 4) / 2;
        }

        static easeInOutQuint(t) {
            return t < 0.5
                ? 16 * t * t * t * t * t
                : 1 - Math.pow(-2 * t + 2, 5) / 2;
        }

        static easeOutBounce(t) {
            const n1 = 7.5625;
            const d1 = 2.75;

            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                t -= 1.5 / d1;
                return n1 * t * t + 0.75;
            } else if (t < 2.5 / d1) {
                t -= 2.25 / d1;
                return n1 * t * t + 0.9375;
            } else {
                t -= 2.625 / d1;
                return n1 * t * t + 0.984375;
            }
        }

        static easeInBounce(t) {
            return 1 - Easing.easeOutBounce(1 - t);
        }
    }

    root.Easing = Easing;
})(window);