(function (root) {
    class EventEmitter {
        constructor() { this._events = Object.create(null); }
        on(evt, fn, scope) {
            (this._events[evt] ||= []).push({ fn, scope });
            return this;
        }
        once(evt, fn, scope) {
            const wrap = (...args) => { this.off(evt, wrap, scope); fn.apply(scope || this, args); };
            wrap._orig = fn;
            return this.on(evt, wrap, scope);
        }
        off(evt, fn, scope) {
            if (!evt) { this._events = Object.create(null); return this; }
            const arr = this._events[evt];
            if (!arr) return this;
            if (!fn) { delete this._events[evt]; return this; }
            this._events[evt] = arr.filter(h =>
                (h.fn !== fn && h.fn._orig !== fn) || (scope && h.scope !== scope)
            );
            if (this._events[evt].length === 0) delete this._events[evt];
            return this;
        }
        emit(evt, ...args) {
            const arr = this._events[evt];
            if (!arr) return false;
            for (const { fn, scope } of arr.slice()) {
                try { fn.apply(scope || this, args); } catch (e) { console.error(e); }
            }
            return true;
        }
    }

    root.EventEmitter = EventEmitter;
})(window);