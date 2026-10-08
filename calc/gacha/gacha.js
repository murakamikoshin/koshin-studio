/* ガチャの全種類コンプリートに必要な回数。
   前提：毎回、全種類から同じ確率で出る。回すたびに独立。
   「いま c 種類持っている」状態から、1 回で新しい種類が出る確率は (n-c)/n。
   その状態の分布を 1 回ずつ進めて、揃う確率を足していく（式の足し引きより、桁があふれず確か）。 */
(function (root) {
  function calc(n, owned, cap) {
    var r = n - owned, i;
    var expected = 0;
    for (i = 1; i <= r; i++) expected += n / i;              /* n × (1 + 1/2 + … + 1/r) */
    var dp = new Array(n + 1).fill(0); dp[owned] = 1;
    var cum = [0], t = 0, done = 0, limit = cap || 200000;
    while (done < 0.9999 && t < limit) {
      t++;
      for (var c = n - 1; c >= owned; c--) {                  /* 後ろから、一回ぶん進める */
        var p = dp[c] * (n - c) / n;
        dp[c + 1] += p; dp[c] -= p;
      }
      done = dp[n]; cum.push(done);
    }
    function at(q) { for (var k = 0; k < cum.length; k++) if (cum[k] >= q) return k; return null; }
    return {
      n: n, owned: owned, remaining: r, expected: expected,
      expectedDup: expected - r,
      p50: at(0.5), p90: at(0.9), p99: at(0.99),
      within: function (m) { return m < 0 ? 0 : m >= cum.length ? (done >= 0.9999 ? 1 : cum[cum.length - 1]) : cum[m]; }
    };
  }
  if (typeof module !== 'undefined') module.exports = { calc: calc };
  else root.gachaCalc = calc;
})(this);
