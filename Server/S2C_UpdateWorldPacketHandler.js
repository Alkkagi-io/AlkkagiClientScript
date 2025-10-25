/*
    Client-side handler for S2C_UpdateWorldPacket - buffered interpolation with visibility management.
*/

(function () {
    if (typeof window === 'undefined') return;

    const INTERPOLATION_DELAY_MS = 120;
    const MAX_SAMPLE_HISTORY = 4;
    const EXTRAPOLATION_LIMIT_MS = 100;
    const WRAPAROUND_TOLERANCE_MS = 5000;
    const OFFSET_SMOOTHING = 0.1;

    function S2C_UpdateWorldPacketHandler(app, network) {
        this.app = app;
        this.network = network;

        this.entityStates = {};
        this.lastServerTimestamp = 0;
        this.timeSync = { initialized: false, offset: 0 };

        this.update = this.update.bind(this);
        this.app.on('update', this.update);
    }

    S2C_UpdateWorldPacketHandler.prototype.handle = function (packet) {
        const now = performance.now();
        const serverTimestamp = packet.elapsedMS;
        if (!Number.isFinite(serverTimestamp)) return;

        if (serverTimestamp < this.lastServerTimestamp) {
            if (this.lastServerTimestamp - serverTimestamp > WRAPAROUND_TOLERANCE_MS) {
                this.lastServerTimestamp = serverTimestamp;
            } else {
                return;
            }
        } else {
            this.lastServerTimestamp = serverTimestamp;
        }

        if (!this.timeSync.initialized) {
            this.timeSync.offset = now - serverTimestamp;
            this.timeSync.initialized = true;
        } else {
            const measuredOffset = now - serverTimestamp;
            this.timeSync.offset =
                this.timeSync.offset * (1 - OFFSET_SMOOTHING) + measuredOffset * OFFSET_SMOOTHING;
        }

        const visibleIds = packet.visibleEntities
            ? new Set(packet.visibleEntities.map(String))
            : null;
        const disappearedIds = packet.disappearedEntityIds || [];

        for (let i = 0; i < packet.entityDatas.length; i++) {
            const entityData = packet.entityDatas[i];
            const entityId = String(entityData.entityID);
            const state = this.entityStates[entityId] || (this.entityStates[entityId] = { samples: [] });

            const sample = {
                time: serverTimestamp,
                position: { x: entityData.position.x, z: entityData.position.y }
            };

            const samples = state.samples;
            const lastSample = samples[samples.length - 1];
            if (!lastSample || lastSample.time < sample.time) {
                samples.push(sample);
                if (samples.length > MAX_SAMPLE_HISTORY) samples.shift();
            } else if (lastSample.time === sample.time) {
                samples[samples.length - 1] = sample;
            }
        }

        for (let i = 0; i < disappearedIds.length; i++) {
            this._despawnEntity(String(disappearedIds[i]));
        }

        if (visibleIds) {
            for (const entityId in this.entityStates) {
                if (!visibleIds.has(entityId)) {
                    this._despawnEntity(entityId);
                }
            }
        }
    };

    S2C_UpdateWorldPacketHandler.prototype.update = function () {

    };

    S2C_UpdateWorldPacketHandler.prototype._despawnEntity = function (entityId) {
        delete this.entityStates[entityId];
        if (this.network && typeof this.network.removeEntity === 'function') {
            this.network.removeEntity(Number(entityId));
        } else {
            const entity = this.network.getOrCreateEntity(Number(entityId));
            if (entity) entity.enabled = false;
        }
    };

    S2C_UpdateWorldPacketHandler.prototype.destroy = function () {
        this.app.off('update', this.update);
        this.entityStates = {};
    };

    window.S2C_UpdateWorldPacketHandler = S2C_UpdateWorldPacketHandler;
})();