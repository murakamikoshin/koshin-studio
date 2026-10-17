/* 抽選に複数回応募したときの当選確率。
   ps: 応募先ごとの当選確率（0〜1）の配列。応募先が違っても、同じでもよい。
   各抽選は、互いに関係なく決まる前提。 */
(function (root) {
  function lottery(ps) {
    var n = ps.length;
    /* dist[j] = ちょうど j 回当たる確率（ポアソン二項分布を 1 つずつ足して作る） */
    var dist = [1];
    for (var i = 0; i < n; i++) {
      var p = ps[i], next = new Array(dist.length + 1).fill(0);
      for (var j = 0; j < dist.length; j++) {
        next[j] += dist[j] * (1 - p);
        next[j + 1] += dist[j] * p;
      }
      dist = next;
    }
    var atLeast = function (k) {
      var s = 0;
      for (var j = k; j < dist.length; j++) s += dist[j];
      return Math.min(1, Math.max(0, s));
    };
    var expected = ps.reduce(function (a, b) { return a + b; }, 0);
    return { n: n, expected: expected, atLeast: atLeast, dist: dist, none: dist[0] };
  }
  /* 全部の応募先が同じ確率 p のとき、q 以上の確率で 1 回以上当たるのに必要な応募数 */
  function entriesNeeded(p, q) {
    if (p >= 1) return 1;
    return Math.ceil(Math.log(1 - q) / Math.log(1 - p) - 1e-12);
  }
  root.lotteryCalc = lottery;
  root.lotteryEntriesNeeded = entriesNeeded;
})(typeof window !== 'undefined' ? window : globalThis);
