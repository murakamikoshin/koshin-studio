(function () {
  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var LANG = document.documentElement.lang || 'ja';
  var T = (window.CALC_I18N || {})[LANG.split('-')[0]] || window.CALC_I18N.ja;
  var f = function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); };
  var money = function (x) { return f(T.money, { n: Math.round(x).toLocaleString(LANG === 'ja' ? 'ja-JP' : LANG) }); };
  var paren = function (s) { return f(T.paren, { x: s }); };
  var pct = function (x) { return x * 100 >= 99.95 ? T.pctMax : (x * 100).toFixed(1) + '%'; };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
  function render() {
    var p = num('p'), k = num('k'), N = num('N'), price = num('price'), m = num('m');
    if (!p || p < 0.001 || p > 100) { out.innerHTML = '<p class="note">' + T.r_errP + '</p>'; return; }
    if (!k || k < 1 || k > 10 || k !== Math.floor(k)) { out.innerHTML = '<p class="note">' + T.r_errK + '</p>'; return; }
    if (N !== null && (N < 2 || N > 500 || N !== Math.floor(N))) { out.innerHTML = '<p class="note">' + T.r_errN + '</p>'; return; }
    if (!N && p < 0.05 && k > 3) { out.innerHTML = '<p class="note">' + T.r_errHeavy + '</p>'; return; }
    var r = window.rateCalc(p / 100, k, N || 0);
    var cost = function (t) { return price ? paren(money(t * price)) : ''; };
    var h = '<div class="calc-main"><p>' + T.avg + '</p><p class="big">' + f(T.big, { n: r.expected.toFixed(1) }) + '</p>' +
      (price ? '<p>' + money(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>' + f(T.r_p50, { n: r.p50, c: cost(r.p50) }) + '</li>' +
      '<li>' + f(T.r_p90, { n: r.p90, c: cost(r.p90) }) + '</li>' +
      '<li>' + f(T.r_p99, { n: r.p99, c: cost(r.p99) }) + '</li>';
    if (N) h += '<li>' + f(T.r_pity, { n1: N - 1, p: pct(r.reachPity) }) + '</li>' +
      '<li>' + f(T.r_max, { t: k * N, c: cost(k * N), k: k }) + '</li>';
    if (m !== null && m >= 0) h += '<li>' + f(T.r_after, { m: Math.floor(m), k: k, p: pct(r.within(Math.floor(m))) }) + '</li>';
    out.innerHTML = h + '</ul>';
  }
  ['p', 'k', 'N', 'price', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
