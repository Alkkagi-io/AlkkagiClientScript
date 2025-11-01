var RankingPanel = pc.createScript('RankingPanel');

RankingPanel.attributes.add('myRankElem', {
    type: 'entity'
});

RankingPanel.attributes.add('rankElems', {
    type: 'entity',
    array: true
});

RankingPanel.prototype.handleUpdateRanking = function(rankPlayerIds, rankPlayerScores) {
    for (let i = 0; i < this.rankElems.length; i++) {
        const elem = this.rankElems[i].script.RankElement;
        const isMyPlayer = rankPlayerIds[i] == gameManager.playerEntityID;
        const rankPlayerData = window.gameManager.getWorldData(rankPlayerIds[i]);

        if (!isMyPlayer && !rankPlayerData) {
            elem.set('-');
            continue
        }

        const name = isMyPlayer ? gameManager.myname : rankPlayerData.name;
        elem.set(this.getScoreText(name, rankPlayerScores[i]));
    }
}

RankingPanel.prototype.updateMyScore = function(score) {
    this.myRankElem.script.RankElement.set(this.getScoreText(gameManager.myname, score));
};  

RankingPanel.prototype.getScoreText = function(name, score) {
    return `${name}-${score}`;
}