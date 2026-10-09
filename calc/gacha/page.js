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
    var n = num('n'), k = num('k') || 0, price = num('price'), set = num('set'), m = num('m');
    if (!n || n < 2 || n > 100 || n !== Math.floor(n)) { out.innerHTML = '<p class="note">' + T.g_errN + '</p>'; return; }
    if (k < 0 || k >= n || k !== Math.floor(k)) { out.innerHTML = '<p class="note">' + T.g_errK + '</p>'; return; }
    var r = window.gachaCalc(n, k);
    var cost = function (t) { return price ? paren(money(t * price)) : ''; };
    var h = '<div class="calc-main"><p>' + T.avg + '</p><p class="big">' + f(T.big, { n: r.expected.toFixed(1) }) + '</p>' +
      (price ? '<p>' + money(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>' + f(T.g_dup, { n: r.expectedDup.toFixed(1) }) + '</li>' +
      '<li>' + f(T.g_p50, { n: r.p50, c: cost(r.p50) }) + '</li>' +
      '<li>' + f(T.g_p90, { n: r.p90, c: cost(r.p90) }) + '</li>' +
      '<li>' + f(T.g_p99, { n: r.p99, c: cost(r.p99) }) + '</li>';
    if (m !== null && m >= 0) h += '<li>' + f(T.g_after, { m: Math.floor(m), p: pct(r.within(Math.floor(m))) }) + '</li>';
    if (set && price) {
      var cnt = Math.floor(set / price), p = r.within(cnt);
      h += '<li>' + f(set < r.expected * price ? T.g_setCheap : T.g_setPricey,
        { price: money(set), cnt: cnt, p: pct(p), avgc: money(r.expected * price) }) + '</li>';
    }
    out.innerHTML = h + '</ul>';
  }
  ['n', 'k', 'price', 'set', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
