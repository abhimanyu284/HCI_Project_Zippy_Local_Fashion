/* ============ AUDIENCES: Men / Women / Kids ============
   Loaded by ui.js right after data.js. It
   1. tags every product with who it is for (p.aud = ['men'], ['women'], ['kids'] or ['men','women']),
   2. adds a range of kids' clothes, and
   3. lets search understand words like "men", "women", "kids", "boys" and "girls". */

const AUDIENCES = [
  { id: 'men',   label: 'Men',   tag: 'Shirts, blazers and kurtas', photo: 'blazer', n: 0 },
  { id: 'women', label: 'Women', tag: 'Dresses, sarees and kurtis', photo: 'dress',  n: 0 },
  { id: 'kids',  label: 'Kids',  tag: 'Tees, party wear, school basics',  photo: 'kids',   n: 0 }
];

/* photos for the kids' range (Unsplash). If one fails, ui.js tries the next in this list. */
PHOTOS.kids = ['photo-1622290291468-a28f7a7dc6a8', 'photo-1518831959646-742c3a14ebf7', 'photo-1758782213532-bbb5fd89885e', 'photo-1607453998825-f3f36da5ab18', 'photo-1611428813653-aa606c998586', 'photo-1622290291165-d341f1938b8a', 'photo-1632337950445-ba446cb0e26f'];
PHOTOS.kids.forEach(id => { POOL_OF[id] = PHOTOS.kids.filter(x => x !== id); });

/* who each existing style is for. M = men, W = women, U = unisex (men and women) */
(function () {
  const ids = s => s.split(' ');
  const M = ids('p1 p2 p3 p4 p5 p6 p7 p8 p13 p14 p17 p18 p19 p25 p26 p28 p44 p45 p46 p47 p49 p50 p51 p53 p54 p64 p66 p70 p71 p73 p91');
  const W = ids('p9 p10 p11 p22 p23 p29 p30 p31 p32 p33 p34 p35 p36 p37 p38 p39 p55 p56 p57 p59 p60 p61 p77 p78 p81 p83 p84 p85 p86 p87 p88 p90');
  const U = ids('p12 p15 p16 p20 p21 p24 p27 p40 p41 p42 p43 p48 p52 p58 p62 p63 p65 p67 p68 p69 p72 p74 p75 p76 p79 p80 p82 p89');
  PRODUCTS.forEach(p => { p.aud = M.includes(p.id) ? ['men'] : W.includes(p.id) ? ['women'] : U.includes(p.id) ? ['men', 'women'] : ['men', 'women']; });

  /* kids' range: [id, name, shop, category, price, mrp, stock S-M-L-XL, daysAgo, rating, reviews] */
  [
    ['p92', 'Kids Cotton Tee (4–10 yrs)', 's7', 'tee', 399, 599, [4, 6, 5, 3], 2, 4.4, 88],
    ['p93', 'Boys Printed Hoodie', 's7', 'hoodie', 899, 1299, [3, 5, 4, 2], 4, 4.3, 64],
    ['p94', 'Kids Denim Shorts', 's3', 'shorts', 599, 899, [4, 4, 3, 0], 3, 4.2, 52],
    ['p95', 'Kids Cotton Joggers', 's3', 'joggers', 649, 899, [5, 6, 4, 2], 1, 4.5, 97],
    ['p96', 'Girls Floral Dress (3–9 yrs)', 's1', 'dress', 1099, 1499, [3, 5, 4, 1], 2, 4.6, 71],
    ['p97', 'Girls Tulle Skirt', 's1', 'skirt', 699, 999, [4, 4, 2, 0], 5, 4.3, 43],
    ['p98', 'Boys Kurta Pyjama Set', 's5', 'kurta', 1199, 1599, [3, 5, 5, 2], 3, 4.5, 58],
    ['p99', 'Girls Lehenga Choli', 's8', 'lehenga', 1999, 2799, [2, 3, 3, 1], 6, 4.7, 39],
    ['p100', 'Kids Denim Jacket', 's3', 'jacket', 1299, 1799, [2, 4, 3, 1], 4, 4.2, 41],
    ['p101', 'Kids Knit Sweater', 's4', 'sweater', 799, 1099, [3, 5, 4, 2], 8, 4.3, 36],
    ['p102', 'Boys Formal Shirt', 's2', 'shirt', 699, 999, [4, 5, 3, 2], 5, 4.1, 47],
    ['p103', 'Boys Chino Trousers', 's4', 'trousers', 799, 1099, [3, 4, 4, 2], 7, 4.2, 33],
    ['p104', 'Kids Straight Jeans', 's3', 'jeans', 899, 1299, [4, 4, 3, 1], 6, 4.1, 55],
    ['p105', 'Girls Party Top', 's6', 'top', 499, 799, [5, 4, 3, 0], 1, 4.4, 62],
    ['p106', 'Kids Track Pants', 's7', 'joggers', 549, 799, [5, 7, 5, 3], 3, 4.3, 84],
    ['p107', 'Boys Blazer Set', 's2', 'blazer', 1999, 2799, [2, 3, 2, 0], 9, 4.4, 28]
  ].forEach((a, i) => {
    const pool = PHOTOS.kids, sizes = {}; SIZES.forEach((s, k) => sizes[s] = a[6][k]);
    PRODUCTS.push({ id: a[0], name: a[1], shop: a[2], cat: a[3], price: a[4], mrp: a[5], sizes, daysAgo: a[7], rating: a[8], count: a[9], imgs: [0, 1, 2].map(k => IMG(pool[(i + k) % pool.length])), aud: ['kids'] });
  });
  AUDIENCES.forEach(a => { a.n = PRODUCTS.filter(p => p.aud.includes(a.id)).length; });
})();

const audById = id => AUDIENCES.find(a => a.id === id);
const audLabel = id => (audById(id) || {}).label || '';
/* categories that have at least one style for this audience, with counts */
function catsFor(aud) {
  return CATEGORIES.map(c => ({ id: c.id, label: c.label, n: PRODUCTS.filter(p => p.cat === c.id && p.aud.includes(aud)).length })).filter(c => c.n);
}

/* search understands "men", "women", "kids", "boys", "girls" */
const AUD_WORDS = { men: 'men', mens: 'men', "men's": 'men', man: 'men', boys: 'kids', boy: 'kids', women: 'women', womens: 'women', "women's": 'women', ladies: 'women', woman: 'women', girls: 'kids', girl: 'kids', kids: 'kids', kid: 'kids', children: 'kids' };
const _matchesQuery = matchesQuery;
matchesQuery = function (p, q) {
  const rest = [];
  for (const w of String(q || '').toLowerCase().split(/\s+/).filter(Boolean)) {
    const a = AUD_WORDS[w];
    if (a) { if (!(p.aud || []).includes(a)) return false; } else rest.push(w);
  }
  return _matchesQuery(p, rest.join(' '));
};