var RankingPanel = pc.createScript('RankingPanel');

RankingPanel.attributes.add('myRankElem', {
    type: 'entity'
});

RankingPanel.attributes.add('rankElems', {
    type: 'entity',
    array: true
});

RankingPanel.prototype.handleUpdateRanking = function(rankPlayerIds, rankPlayerScores) {
    for (const i = 0; i < this.rankElems.lenght; i++) {
        const elem = this.rankElems[i];
        const rankPlayer = window.gameManager.getEntity(rankPlayerIds[i]);
        if (rankPlayer == null) {
            elem.set('-');
            continue
        }

        elem.set(this.getScoreText(rankPlayer.entityData.name, rankPlayerScores[i]));
    }
}

RankingPanel.prototype.updateMyScore = function(score) {
    const myEntity = window.gameManager.getEntity(window.gameManager.playerEntityID);
    if (!myEntity)
        return;

    const name = myEntity.entityData.name;
    this.myRankElem.set(getScoreText(name, score));
};  

RankingPanel.prototype.getScoreText = function(name, score) {
    return `${name}-${score}`;
}