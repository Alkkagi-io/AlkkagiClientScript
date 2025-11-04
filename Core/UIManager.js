(function (root) {
    class UIManager {
        constructor(uiSoundMap) {
            this.screens = {};
            this._uiSoundMap = uiSoundMap;
            this._currentScreen = null;
            this.createCustomOverlayDiv();
        }

        // type: title, ingame, result
        addScreen(type, screenEntity) {
            this.screens[type] = screenEntity;
        }

        getScreen(type) {
            return this.screens[type];
        }

        playUISound(soundSlot) {
            const soundAsset = this._uiSoundMap.get(soundSlot);
            AudioManager.playSound(soundAsset, 1);
        }

        showToastPopup(text, time) {
            if (!this.toastPopup || this.toastPopup.entity.enabled)
                return;

            this.toastPopup.show(text, time);
        }

        showScreen(type) {
            if (this._currentScreen) {
                this._currentScreen.enabled = false;
                this._currentScreen = null;
            }

            this._currentScreen = this.getScreen(type);
            this._currentScreen.enabled = true;
            return this._currentScreen;
        }

        createCustomOverlayDiv() {
            const canvas = document.getElementById('application-canvas');
            if (!canvas) {
                console.warn('[UIManager] #application-canvas not found');
                return null;
            }

            const parent = canvas.parentNode;
            const ps = getComputedStyle(parent);
            if (ps.position === 'static') parent.style.position = 'relative';

            this.overlayDiv = document.createElement('div');
            Object.assign(this.overlayDiv.style, {
                position: 'absolute',
                left: '0px', top: '0px', width: '0px', height: '0px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: (parseInt(getComputedStyle(canvas).zIndex) || 0) + 1,
                pointerEvents: 'none'
            });

            parent.insertBefore(this.overlayDiv, canvas.nextSibling);

            const syncOverlay = () => {
                const rect = canvas.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                this.overlayDiv.style.left   = (rect.left - parentRect.left + parent.scrollLeft) + 'px';
                this.overlayDiv.style.top    = (rect.top  - parentRect.top  + parent.scrollTop ) + 'px';
                this.overlayDiv.style.width  = rect.width  + 'px';
                this.overlayDiv.style.height = rect.height + 'px';
            };
            this._syncOverlay = syncOverlay;
            syncOverlay();

            this._ro = new ResizeObserver(syncOverlay);
            this._ro.observe(canvas);
            this._mo = new MutationObserver(syncOverlay);
            this._mo.observe(canvas, { attributes: true, attributeFilter: ['style','width','height','class'] });
            window.addEventListener('resize', syncOverlay);

            return this.overlayDiv;
        }
    }

    root.UIManager = UIManager;
})(window);