(function (root) {
    class UIManager {
        constructor(uiSoundMap) {
            this.screens = {};
            this._uiSoundMap = uiSoundMap;
            this._currentScreen = null;
            this.createCustomOverlayDiv();
            // this.createBlockDiv("테스트 블락 패널 입니다.\nddd")
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

        createBlockDiv(text) {
            const overlay = this.overlayDiv;
            if (!overlay) {
                console.warn('[UIManager] overlayDiv not found');
                return null;
            }

            const parent = overlay.parentNode;

            // 중복 생성 방지
            if (this.blockDiv && this.blockDiv.parentNode) return this.blockDiv;

            // overlay 위로 덮기 (z-index 계산)
            const overlayZ = parseInt(getComputedStyle(overlay).zIndex) || 1;
            const blockZ = overlayZ + 1; // overlay보다 위로

            // 화면 전체 차단용 div 생성
            this.blockDiv = document.createElement('div');
            Object.assign(this.blockDiv.style, {
                position: 'fixed',
                left: '0',
                top: '0',
                width: '100vw',
                height: '100vh',
                zIndex: String(blockZ),
                background: 'rgba(0, 0, 0, 0.85)',
                pointerEvents: 'auto',
                display: 'flex', 
                userSelect: 'none',
                touchAction: 'none',
                overscrollBehavior: 'none',
            });

            const textEl = document.createElement('div');
            textEl.textContent = text;
            Object.assign(textEl.style, {
                color: '#fff',  
                position: 'absolute',
                left: '50%',
                top: '40%',
                transform: 'translate(-50%, 50%)',
                fontSize: '2vw',
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: '1.35',
                letterSpacing: '0.2px',
                // 멀티라인 대비
                wordBreak: 'keep-all',
                whiteSpace: 'pre-wrap'
            });
            this.blockDiv.appendChild(textEl);

            // 모든 입력 막기
            const swallow = (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                return false;
            };
            [
                'pointerdown','pointermove','pointerup','pointercancel',
                'mousedown','mousemove','mouseup','click','dblclick','contextmenu',
                'touchstart','touchmove','touchend','touchcancel',
                'wheel','scroll','keydown','keyup'
            ].forEach(type => this.blockDiv.addEventListener(type, swallow, { passive: false }));

            // overlay 위로 삽입
            if (overlay.nextSibling) parent.insertBefore(this.blockDiv, overlay.nextSibling);
            else parent.appendChild(this.blockDiv);

            return this.blockDiv;
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