(function (root) {
    class S2C_UpdateRankingPacketHandler extends ClientPacketHandler {
        handle(packet) {
            const screen = uiManager.getScreen('ingame');
            const rankPanel = screen.rankingPanel.script.RankingPanel;
            rankPanel.handleUpdateRanking(packet.rankingPlayerIds, packet.rankingPlayerScores);
        }
    }

    root.S2C_UpdateRankingPacketHandler = S2C_UpdateRankingPacketHandler;
})(window);