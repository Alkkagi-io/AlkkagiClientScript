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
        const rankPlayer = window.gameManager.getEntity(rankPlayerIds[i]);
        if (rankPlayer == null) {
            elem.set('-');
            continue
        }

        elem.set(this.getScoreText(rankPlayer.script.entityComponent.entityStaticData.name, rankPlayerScores[i]));
    }
}

RankingPanel.prototype.updateMyScore = function(score) {
    const myEntity = window.gameManager.getEntity(window.gameManager.playerEntityID);
    if (!myEntity)
        return;

    const name = myEntity.script.entityComponent.entityStaticData.name;
    this.myRankElem.script.RankElement.set(this.getScoreText(name, score));
};  

RankingPanel.prototype.getScoreText = function(name, score) {
    return `${name}-${score}`;
}