(function(root) {
    class UITweener {
        constructor() {
            this.tweenMap = new Map();   
        }

        update(deltaTime) {
            for (const [target, tween] of this.tweenMap.entries()) {
                if (!target)
                    this.tweenMap.delete(target);
                
                tween.elapsed += deltaTime;

                const t = Math.min(tween.elapsed / tween.duration, 1);
                const eased = tween.easing(t);

                // position
                if (tween.type === 'move') {
                    target.setLocalPosition(
                        tween.startX + (tween.endX - tween.startX) * eased,
                        tween.startY + (tween.endY - tween.startY) * eased,
                        0
                    );
                }

                // scale
                if (tween.type === 'scale') {
                    target.setLocalScale(
                        tween.startX + (tween.endX - tween.startX) * eased,
                        tween.startY + (tween.endY - tween.startY) * eased,
                        1
                    );
                }

                if (t >= 1)
                    this._completeTween(target, tween);
            }
        }

        _completeTween(target, tween) {
            if (tween.onComplete)
                tween.onComplete();

            this.tweenMap.delete(target);
        }

        doMove(target, endX, endY, duration, onComplete = null, easing = t => t) {
            if (!target)
                return;

            const startPos = target.getLocalPosition();

            this.tweenMap.set(target, {
                type: 'move',
                startX: startPos.x,
                startY: startPos.y,
                endX,
                endY,
                duration,
                elapsed: 0,
                onComplete,
                easing
            });
        }

        doScale(target, endX, endY, duration, onComplete = null, easing = t => t) {
            if (!target)
                return;

            const startScale = target.getLocalScale();

            this.tweenMap.set(target, {
                type: 'scale',
                startX: startScale.x,
                startY: startScale.y,
                endX,
                endY,
                duration,
                elapsed: 0,
                onComplete,
                easing
            });
        }
    }

    root.UITweener = UITweener;
})(window);