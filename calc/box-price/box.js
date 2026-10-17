/* BOX や セットの価格を、1パックあたりに直して、定価と比べる。
   price: 支払う合計（円）、packs: 中のパック数、retailPack: 1パックの定価（任意）、
   shipping: 送料（任意）。 */
(function (root) {
  function boxPrice(o) {
    var total = o.price + (o.shipping || 0);
    var perPack = total / o.packs;
    var r = { total: total, perPack: perPack };
    if (o.retailPack > 0) {
      r.retailBox = o.retailPack * o.packs;
      r.ratio = perPack / o.retailPack;
      r.diff = total - r.retailBox;
    }
    return r;
  }
  root.boxPriceCalc = boxPrice;
})(typeof window !== 'undefined' ? window : globalThis);
