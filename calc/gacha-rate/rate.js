/* ガチャの当たり確率と天井。
   前提：1 回ごとに、同じ確率 p で当たる（回すたびに独立）。
   天井 N：N 回目まで当たりが出なければ、N 回目は必ず当たり。当たったら、数え直す。
   欲しい数 k：k 個当たるまでの回数 T を、1 個ぶんの回数の分布を k 回重ねて作る。 */
(function (root) {
  function single(p, N) {                      /* 1 個当たるまでの回数の分布 f[t]（t = 1…） */
    var f = [0], q = 1 - p, t, rem = 1;
    if (N) {
      for (t = 1; t < N; t++) { f.push(p * Math.pow(q, t - 1)); }
      f.push(Math.pow(q, N - 1));              /* N 回目で確定 */
    }
    return f;
  }
  function lgamma(x) {                         /* ランチョス近似 */
    var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
    x -= 1; var a = c[0], t = x + g + 0.5;
    for (var i = 1; i < g + 2; i++) a += c[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }
  function calc(p, k, N) {
    var q = 1 - p, cum = [0], mass = 0, t;
    var expected, probs = [0];
    if (N) {
      var f = single(p, N), cur = f.slice(), j, a, b;
      for (j = 2; j <= k; j++) {               /* 重ねる */
        var nx = new Array(cur.length + N).fill(0);
        for (a = 1; a < cur.length; a++) if (cur[a]) for (b = 1; b <= N; b++) nx[a + b] += cur[a] * f[b];
        cur = nx;
      }
      probs = cur;
      expected = k * ((1 - Math.pow(q, N)) / p);
    } else {
      var lq = Math.log(q), lp = Math.log(p), limit = 200000;
      expected = k / p;
      if (p >= 1) { probs[k] = 1; mass = 1; }          /* 必ず当たる */
      for (t = k; p < 1 && t < limit && mass < 0.99999; t++) {
        var lg = lgamma(t) - lgamma(k) - lgamma(t - k + 1);        /* C(t-1, k-1) */
        var pr = Math.exp(lg + k * lp + (t - k) * lq);
        probs[t] = pr; mass += pr;
      }
    }
    var s = 0; cum = [0];
    for (t = 1; t < probs.length; t++) { s += probs[t] || 0; cum.push(s); }
    function at(x) { for (var i = 0; i < cum.length; i++) if (cum[i] >= x) return i; return null; }
    return {
      expected: expected, p50: at(0.5), p90: at(0.9), p99: at(0.99),
      within: function (m) { return m <= 0 ? 0 : m >= cum.length ? Math.min(1, cum[cum.length - 1]) : cum[m]; },
      reachPity: N ? Math.pow(q, N - 1) : null
    };
  }
  if (typeof module !== 'undefined') module.exports = { calc: calc };
  else root.rateCalc = calc;
})(this);
