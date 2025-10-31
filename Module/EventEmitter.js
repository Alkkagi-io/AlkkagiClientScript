(function (root) {
    class EventEmitter {
        constructor() {
            this._events = Object.create(null);
        }

        on(evt, fn, scope, order) {
            const normalizedOrder = this._normalizeOrder(order);
            const handler = { fn, scope, order: normalizedOrder };
            const list = this._events[evt] ||= [];

            list.push(handler);
            list.sort((a, b) => a.order - b.order);

            return this;
        }

        once(evt, fn, scope, order) {
            const normalizedOrder = this._normalizeOrder(order);

            const wrap = (...args) => {
                this.off(evt, wrap, scope);
                fn.apply(scope || this, args);
            };

            wrap._orig = fn;
            return this.on(evt, wrap, scope, normalizedOrder);
        }

        off(evt, fn, scope) {
            if (!evt) {
                this._events = Object.create(null);
                return this;
            }

            const handlers = this._events[evt];
            if (!handlers) {
                return this;
            }

            if (!fn) {
                delete this._events[evt];
                return this;
            }

            const checkScope = scope !== undefined;

            this._events[evt] = handlers.filter(handler => {
                const fnMatch = handler.fn === fn || handler.fn._orig === fn;
                if (!fnMatch) {
                    return true;
                }

                if (checkScope && handler.scope !== scope) {
                    return true;
                }

                return false;
            });

            if (this._events[evt].length === 0) {
                delete this._events[evt];
            }

            return this;
        }

        emit(evt, ...args) {
            const handlers = this._events[evt];
            if (!handlers) {
                return false;
            }

            for (const { fn, scope } of handlers.slice()) {
                try {
                    fn.apply(scope || this, args);
                } catch (error) {
                    console.error(error);
                }
            }

            return true;
        }

        _normalizeOrder(order) {
            if (order === undefined || order === null) return 0;

            const numeric = Number(order);
            return Number.isFinite(numeric) ? numeric : 0;
        }
    }

    root.EventEmitter = EventEmitter;
})(window);
