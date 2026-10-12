/* ============ ZIPPY MOCK DATA ============
   Photos come from Unsplash. Every category has a pool of photos: if one
   fails to load, ui.js automatically tries the next photo in the same pool,
   and finally shows a tidy placeholder with the product name. So you can
   safely swap any photo ID below, or point `imgs` at your own files. */
const IMG = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const PHOTOS = {
  blazer:   ['photo-1507679799987-c73779587ccf', 'photo-1594938298603-c8148c4dae35', 'photo-1593030761757-71fae45fa0e7', 'photo-1617137968427-85924c800a22'],
  kurta:    ['photo-1583391733956-3750e0ff4e8b', 'photo-1583496661160-fb5886a13d27', 'photo-1617627143750-d86bc21e42bb', 'photo-1610030469983-98e550d6193c'],
  dress:    ['photo-1496747611176-843222e1e57c', 'photo-1595777457583-95e059d581b8', 'photo-1572804013309-59a88b7e92f1', 'photo-1539109136881-3be0616acf4b'],
  jacket:   ['photo-1551028719-00167b16eac5', 'photo-1591047139829-d91aecb6caea', 'photo-1548883354-94bcfe321cbb', 'photo-1521223890158-f9f7c3d5d504'],
  tee:      ['photo-1521572163474-6864f9cf17ab', 'photo-1583743814966-8936f5b7be1a', 'photo-1503341504253-dff4815485f1', 'photo-1576566588028-4147f3842f27', 'photo-1562157873-818bc0726f68'],
  jeans:    ['photo-1542272604-787c3835535d', 'photo-1541099649105-f69ad21f3246', 'photo-1555689502-c4b22d76c56f', 'photo-1473966968600-fa801b869a1a'],
  hoodie:   ['photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa76e52ff62e', 'photo-1620799140408-edc6dcb6d633', 'photo-1556905055-8f358a7a47b2'],
  saree:    ['photo-1610189844280-d4fa3d7c8c0b', 'photo-1610030469983-98e550d6193c', 'photo-1583391733981-8b530b0a0bd4', 'photo-1617627143750-d86bc21e42bb'],
  shirt:    ['photo-1596755094514-f87e34085b2c', 'photo-1602810318383-e386cc2a3ccf', 'photo-1598033129183-c4f50c736f10', 'photo-1603252109303-2751441dd157'],
  trousers: ['photo-1473966968600-fa801b869a1a', 'photo-1594938298603-c8148c4dae35', 'photo-1506629082955-511b1aa562c8', 'photo-1624378439575-d8705ad7ae80'],
  shorts:   ['photo-1591195853828-11db59a44f6b', 'photo-1565084888279-aca607ecce0c', 'photo-1503341504253-dff4815485f1', 'photo-1506629082955-511b1aa562c8'],
  skirt:    ['photo-1577900232427-18219b9166a0', 'photo-1551163943-3f6a855d1153', 'photo-1572804013309-59a88b7e92f1', 'photo-1583496661160-fb5886a13d27'],
  top:      ['photo-1485968579580-b6d095142e6e', 'photo-1485230895905-ec40ba36b9bc', 'photo-1503342217505-b0a15ec3261c', 'photo-1434389677669-e08b4cac3105'],
  lehenga:  ['photo-1617627143750-d86bc21e42bb', 'photo-1583391733981-8b530b0a0bd4', 'photo-1610189844280-d4fa3d7c8c0b', 'photo-1583391733956-3750e0ff4e8b'],
  joggers:  ['photo-1552902865-b72c031ac5ea', 'photo-1517438476312-10d79c077509', 'photo-1556821840-3a63f95609a7', 'photo-1578768079052-aa76e52ff62e'],
  sweater:  ['photo-1576566588028-4147f3842f27', 'photo-1434389677669-e08b4cac3105', 'photo-1620799140408-edc6dcb6d633', 'photo-1556905055-8f358a7a47b2']
};
const SHOP_PHOTOS = ['photo-1441984904996-e0b6ba687e04', 'photo-1567401893414-76b7b1e5a7a5', 'photo-1558769132-cb1aea458c5e', 'photo-1490481651871-ab68de25d43d', 'photo-1523381210434-271e8be1f52b', 'photo-1445205170230-053b83016050'];

/* photo id -> other ids in the same pool (used by ui.js when a photo fails to load) */
const POOL_OF = {};
[...Object.values(PHOTOS), SHOP_PHOTOS].forEach(pool => pool.forEach(id => {
  POOL_OF[id] = [...new Set([...(POOL_OF[id] || []), ...pool.filter(x => x !== id)])];
}));

const CATEGORIES = [
  { id: 'blazer', label: 'Blazers' }, { id: 'shirt', label: 'Shirts' }, { id: 'tee', label: 'Tees' }, { id: 'trousers', label: 'Trousers' },
  { id: 'jeans', label: 'Jeans' }, { id: 'shorts', label: 'Shorts' }, { id: 'joggers', label: 'Track Pants' }, { id: 'hoodie', label: 'Hoodies' },
  { id: 'sweater', label: 'Sweaters' }, { id: 'jacket', label: 'Jackets' }, { id: 'top', label: 'Tops' }, { id: 'dress', label: 'Dresses' },
  { id: 'skirt', label: 'Skirts' }, { id: 'kurta', label: 'Kurtas & Suits' }, { id: 'saree', label: 'Sarees' },
  { id: 'lehenga', label: 'Lehengas' }
];
const SHOP_TYPES = ['Boutique', 'Formal', 'Streetwear', 'Ethnic', 'Thrift'];
const SIZES = ['S', 'M', 'L', 'XL'];

/* id, name, type, km, rating, ratingCount, open hour, close hour, followers, area, about */
const SHOPS = [
  ['s1', 'Nova Boutique', 'Boutique', 0.4, 4.5, 128, 10, 21, 1240, '12th Main, Indiranagar', 'Curated everyday and occasion wear from independent designers.'],
  ['s2', 'The Formal Edit', 'Formal', 0.9, 4.4, 96, 10, 21, 860, '100 Feet Road, Indiranagar', 'Sharp tailoring for work, interviews and weddings.'],
  ['s3', 'Urban Threads', 'Streetwear', 1.2, 4.3, 210, 11, 22, 2310, 'CMH Road, Indiranagar', 'Denim, tees and layers for the city crowd.'],
  ['s4', 'Classic Co.', 'Formal', 1.5, 4.2, 88, 10, 20, 540, 'Old Madras Road', 'Timeless menswear and smart-casual staples.'],
  ['s5', 'Desi Drape', 'Ethnic', 1.8, 4.6, 174, 10, 21, 1980, '5th Cross, Domlur', 'Festive kurtas, salwar suits, sarees and fusion wear.'],
  ['s6', 'Thrift Loop', 'Thrift', 2.4, 4.1, 63, 12, 20, 420, 'Koramangala 4th Block', 'Pre-loved and vintage pieces, one of a kind.'],
  ['s7', 'Street Lane', 'Streetwear', 3.1, 4.0, 102, 11, 22, 1175, 'HSR Layout Sector 2', 'Oversized fits, hoodies, joggers and graphic tees.'],
  ['s8', 'Rosewood Ethnics', 'Ethnic', 4.5, 4.7, 145, 10, 21, 2640, 'Jayanagar 4th Block', 'Handloom sarees, lehengas and heritage kurtas.']
].map((a, i) => ({
  id: a[0], name: a[1], type: a[2], km: a[3], rating: a[4], count: a[5], from: a[6], to: a[7],
  followers: a[8], area: a[9], about: a[10], img: IMG(SHOP_PHOTOS[i % SHOP_PHOTOS.length], 800)
}));

/* id, name, shop, category, price, mrp, [S,M,L,XL stock], daysAgo, rating, ratingCount */
const PRODUCTS = [
  ['p1', 'Formal Blazer - Navy', 's1', 'blazer', 2699, 3499, [2, 6, 4, 0], 2, 4.2, 128],
  ['p2', 'Slim Fit Formal Blazer', 's2', 'blazer', 2999, 3999, [0, 3, 2, 1], 5, 4.4, 96],
  ['p3', 'Formal Blazer - Grey', 's4', 'blazer', 3299, 4199, [3, 5, 0, 2], 1, 4.1, 74],
  ['p4', 'Classic Blazer', 's4', 'blazer', 2599, 3199, [1, 4, 6, 3], 12, 4.5, 211],
  ['p5', 'Charcoal Double-Breasted Blazer', 's2', 'blazer', 4299, 5499, [0, 2, 3, 0], 3, 4.6, 58],
  ['p6', 'Cotton Kurta Set', 's5', 'kurta', 1299, 1799, [4, 6, 5, 2], 4, 4.3, 152],
  ['p7', 'Chikankari Kurta', 's8', 'kurta', 1899, 2499, [2, 3, 0, 1], 8, 4.5, 87],
  ['p8', 'Festive Silk Kurta', 's5', 'kurta', 2299, 2999, [0, 2, 2, 0], 2, 4.4, 64],
  ['p9', 'Pleated Midi Dress', 's1', 'dress', 1599, 2199, [3, 4, 2, 0], 1, 4.2, 110],
  ['p10', 'Floral Wrap Dress', 's1', 'dress', 1799, 2399, [2, 5, 3, 1], 6, 4.3, 93],
  ['p11', 'Satin Slip Dress', 's6', 'dress', 1399, 1999, [1, 2, 0, 0], 3, 4.0, 45],
  ['p12', 'Denim Jacket', 's3', 'jacket', 1899, 2599, [2, 4, 3, 2], 5, 4.4, 134],
  ['p13', 'Bomber Jacket', 's7', 'jacket', 2199, 2999, [0, 3, 2, 1], 2, 4.2, 67],
  ['p14', 'Leather Biker Jacket', 's6', 'jacket', 3999, 5499, [1, 1, 2, 0], 9, 4.6, 38],
  ['p15', 'Oversized Graphic Tee', 's7', 'tee', 799, 1099, [5, 8, 6, 4], 1, 4.2, 240],
  ['p16', 'Essential White Tee', 's3', 'tee', 599, 799, [6, 9, 7, 5], 10, 4.4, 310],
  ['p17', 'Striped Polo Tee', 's4', 'tee', 899, 1199, [3, 4, 4, 0], 7, 4.1, 88],
  ['p18', 'Straight Fit Jeans', 's3', 'jeans', 1599, 2199, [3, 6, 5, 3], 4, 4.3, 176],
  ['p19', 'Baggy Cargo Jeans', 's7', 'jeans', 1799, 2399, [2, 3, 0, 2], 2, 4.1, 59],
  ['p20', 'Pullover Hoodie', 's7', 'hoodie', 1499, 1999, [4, 6, 6, 3], 3, 4.5, 205],
  ['p21', 'Zip Hoodie', 's6', 'hoodie', 1699, 2299, [0, 3, 2, 1], 6, 4.3, 77],
  ['p22', 'Banarasi Saree with Blouse', 's8', 'saree', 3499, 4999, [2, 3, 3, 1], 3, 4.7, 92],
  ['p23', 'Cotton Handloom Saree', 's8', 'saree', 1999, 2799, [3, 5, 4, 0], 5, 4.3, 69],
  ['p24', 'Linen Resort Shirt', 's1', 'shirt', 1299, 1799, [2, 5, 4, 2], 1, 4.2, 81],
  /* ---- everyday + local-store staples ---- */
  ['p25', 'Formal Trousers - Charcoal', 's2', 'trousers', 1499, 1999, [3, 6, 5, 2], 4, 4.3, 142],
  ['p26', 'Slim Fit Chinos - Beige', 's4', 'trousers', 1399, 1899, [2, 5, 4, 3], 2, 4.2, 98],
  ['p27', 'Linen Drawstring Pants', 's1', 'trousers', 1299, 1799, [4, 4, 2, 0], 6, 4.1, 54],
  ['p28', 'Cotton Bermuda Shorts', 's7', 'shorts', 699, 999, [5, 7, 6, 4], 3, 4.1, 120],
  ['p29', 'Denim Shorts', 's3', 'shorts', 999, 1399, [3, 4, 0, 2], 5, 4.2, 73],
  ['p30', 'Pleated Midi Skirt', 's1', 'skirt', 1199, 1699, [3, 5, 3, 0], 2, 4.3, 61],
  ['p31', 'A-line Denim Skirt', 's6', 'skirt', 899, 1299, [2, 3, 1, 0], 7, 4.0, 39],
  ['p32', 'Ribbed Crop Top', 's1', 'top', 599, 899, [4, 6, 3, 0], 1, 4.2, 150],
  ['p33', 'Peplum Top', 's6', 'top', 799, 1199, [2, 3, 2, 1], 4, 4.0, 47],
  ['p34', 'Cotton Kurti Top', 's5', 'top', 899, 1299, [4, 5, 5, 3], 3, 4.4, 133],
  ['p35', 'Anarkali Salwar Suit', 's5', 'kurta', 2499, 3299, [2, 4, 3, 1], 2, 4.5, 101],
  ['p36', 'Cotton Patiala Suit', 's8', 'kurta', 1899, 2499, [3, 4, 4, 0], 6, 4.4, 76],
  ['p37', 'Straight Cut Salwar Set', 's5', 'kurta', 1699, 2299, [3, 5, 4, 2], 8, 4.3, 88],
  ['p38', 'Festive Lehenga Choli', 's8', 'lehenga', 5999, 8499, [1, 2, 2, 0], 3, 4.7, 52],
  ['p39', 'Silk Bridal-Lite Lehenga', 's5', 'lehenga', 6999, 9499, [0, 2, 1, 1], 9, 4.6, 34],
  ['p40', 'Everyday Track Pants', 's7', 'joggers', 999, 1399, [5, 8, 6, 4], 2, 4.3, 190],
  ['p41', 'Cotton Joggers', 's3', 'joggers', 1099, 1499, [4, 6, 5, 2], 5, 4.2, 112],
  ['p42', 'Woollen Cardigan', 's6', 'sweater', 1499, 2099, [2, 3, 3, 1], 4, 4.4, 66],
  ['p43', 'Crew Neck Sweater', 's4', 'sweater', 1799, 2399, [3, 4, 4, 2], 1, 4.3, 79],
  /* ---- more stock for every shop and category ---- */
  ['p44', 'Oxford Formal Shirt - White', 's2', 'shirt', 1299, 1700, [4, 0, 0, 3], 2, 4.5, 209],
  ['p45', 'Pinstripe Formal Shirt', 's2', 'shirt', 1499, 1900, [7, 3, 5, 1], 1, 4.1, 151],
  ['p46', 'Sky Blue Formal Shirt', 's2', 'shirt', 1199, 1600, [5, 0, 4, 0], 6, 4.0, 174],
  ['p47', 'Pleated Formal Trousers - Navy', 's2', 'trousers', 1699, 2200, [5, 4, 0, 4], 11, 4.0, 74],
  ['p48', 'Merino V-neck Sweater', 's2', 'sweater', 1999, 2600, [5, 0, 0, 5], 2, 4.3, 35],
  ['p49', 'Black Tuxedo Blazer', 's2', 'blazer', 4999, 6500, [3, 1, 0, 6], 3, 4.1, 76],
  ['p50', 'Checked Casual Shirt', 's4', 'shirt', 1099, 1400, [5, 2, 3, 2], 8, 4.2, 136],
  ['p51', 'Corduroy Trousers', 's4', 'trousers', 1599, 2100, [5, 7, 6, 6], 9, 4.4, 68],
  ['p52', 'Cable-Knit Sweater', 's4', 'sweater', 1999, 2600, [7, 4, 7, 6], 7, 4.6, 60],
  ['p53', 'Quilted Jacket', 's4', 'jacket', 2799, 3600, [6, 3, 0, 5], 8, 4.4, 203],
  ['p54', 'Henley Tee', 's4', 'tee', 749, 1000, [4, 7, 3, 1], 6, 4.6, 215],
  ['p55', 'Tiered Maxi Dress', 's1', 'dress', 2199, 2900, [2, 6, 4, 2], 7, 4.0, 192],
  ['p56', 'Satin Blouse', 's1', 'top', 1199, 1600, [4, 0, 6, 3], 3, 4.5, 161],
  ['p57', 'Tailored Wide-Leg Trousers', 's1', 'trousers', 1799, 2300, [4, 0, 3, 4], 2, 4.2, 210],
  ['p58', 'Textured Knit Sweater', 's1', 'sweater', 1699, 2200, [5, 1, 3, 4], 11, 4.1, 138],
  ['p59', 'Pastel Co-ord Blazer', 's1', 'blazer', 2899, 3800, [7, 3, 4, 0], 9, 4.4, 58],
  ['p60', 'Floral Midi Skirt', 's1', 'skirt', 1399, 1800, [3, 6, 1, 5], 8, 4.3, 163],
  ['p61', 'Black Skinny Jeans', 's3', 'jeans', 1699, 2200, [3, 0, 1, 3], 9, 4.0, 97],
  ['p62', 'Washed Straight Jeans', 's3', 'jeans', 1799, 2300, [5, 3, 7, 0], 10, 4.5, 38],
  ['p63', 'Denim Overshirt', 's3', 'shirt', 1799, 2300, [7, 5, 0, 6], 6, 4.4, 164],
  ['p64', 'Pocket Tee', 's3', 'tee', 699, 900, [6, 1, 0, 5], 10, 4.2, 67],
  ['p65', 'Fleece Hoodie', 's3', 'hoodie', 1599, 2100, [0, 4, 1, 0], 11, 4.3, 118],
  ['p66', 'Cargo Shorts', 's3', 'shorts', 1099, 1400, [3, 5, 4, 0], 4, 4.5, 218],
  ['p67', 'Fleece Joggers', 's3', 'joggers', 1299, 1700, [5, 7, 0, 6], 8, 4.5, 188],
  ['p68', 'Oversized Hoodie - Black', 's7', 'hoodie', 1699, 2200, [3, 4, 6, 7], 4, 4.4, 205],
  ['p69', 'Wide-Leg Jeans', 's7', 'jeans', 1899, 2500, [6, 4, 4, 1], 6, 4.3, 111],
  ['p70', 'Windcheater Jacket', 's7', 'jacket', 1999, 2600, [4, 3, 3, 4], 5, 4.2, 58],
  ['p71', 'Mesh Basketball Shorts', 's7', 'shorts', 799, 1000, [6, 0, 1, 4], 2, 4.3, 50],
  ['p72', 'Cuffed Joggers', 's7', 'joggers', 1199, 1600, [5, 6, 5, 4], 6, 4.2, 194],
  ['p73', 'Flannel Shirt', 's7', 'shirt', 1399, 1800, [3, 4, 0, 0], 2, 4.5, 87],
  ['p74', 'Vintage Denim Jeans', 's6', 'jeans', 899, 1200, [5, 0, 0, 3], 4, 4.1, 209],
  ['p75', 'Retro Band Tee', 's6', 'tee', 499, 600, [3, 6, 7, 2], 1, 4.5, 216],
  ['p76', 'Corduroy Jacket', 's6', 'jacket', 1699, 2200, [2, 3, 6, 7], 7, 4.5, 37],
  ['p77', 'Vintage Floral Dress', 's6', 'dress', 1099, 1400, [3, 7, 4, 0], 3, 4.4, 220],
  ['p78', 'Pleated Mini Skirt', 's6', 'skirt', 799, 1000, [5, 0, 7, 3], 3, 4.5, 49],
  ['p79', 'Chunky Knit Sweater', 's6', 'sweater', 1199, 1600, [3, 7, 1, 0], 3, 4.1, 214],
  ['p80', 'Vintage Printed Shirt', 's6', 'shirt', 699, 900, [6, 4, 7, 6], 1, 4.6, 156],
  ['p81', 'Georgette Saree', 's5', 'saree', 2599, 3400, [5, 6, 3, 1], 2, 4.4, 159],
  ['p82', 'Printed Cotton Kurta', 's5', 'kurta', 999, 1300, [4, 7, 2, 5], 2, 4.3, 123],
  ['p83', 'Palazzo Kurta Set', 's5', 'kurta', 1799, 2300, [2, 0, 0, 1], 10, 4.1, 31],
  ['p84', 'Embroidered Anarkali', 's5', 'kurta', 2899, 3800, [2, 1, 1, 6], 7, 4.6, 92],
  ['p85', 'Mirror-work Lehenga', 's5', 'lehenga', 4999, 6500, [4, 5, 0, 4], 3, 4.5, 210],
  ['p86', 'Kurti with Dupatta', 's5', 'top', 1199, 1600, [0, 5, 2, 4], 4, 4.2, 122],
  ['p87', 'Kanjivaram Silk Saree', 's8', 'saree', 7999, 10400, [3, 4, 3, 2], 2, 4.2, 48],
  ['p88', 'Linen Saree', 's8', 'saree', 2299, 3000, [0, 6, 7, 2], 5, 4.4, 104],
  ['p89', 'Block Print Kurta', 's8', 'kurta', 1499, 1900, [1, 1, 4, 5], 2, 4.5, 115],
  ['p90', 'Pastel Lehenga', 's8', 'lehenga', 6499, 8400, [3, 0, 4, 2], 3, 4.3, 112],
  ['p91', 'Silk Kurta Set', 's8', 'kurta', 2999, 3900, [4, 7, 6, 3], 9, 4.3, 217]
].map((a, i) => {
  const pool = PHOTOS[a[3]];
  const imgs = [0, 1, 2].map(k => IMG(pool[(i + k) % pool.length]));
  const sizes = {}; SIZES.forEach((s, k) => sizes[s] = a[6][k]);
  return { id: a[0], name: a[1], shop: a[2], cat: a[3], price: a[4], mrp: a[5], sizes, daysAgo: a[7], rating: a[8], count: a[9], imgs };
});

const REVIEW_BANK = [
  ['True to size, great fabric quality', 5, 'true'], ['Runs slightly long in the sleeves', 4, 'large'],
  ['Material feels premium for the price', 5, 'true'], ['A bit snug around the shoulders, size up', 3, 'small'],
  ['Delivered in 12 minutes and fits perfectly', 5, 'true'], ['Colour exactly as shown in the photos', 4, 'true'],
  ['Stitching is neat, wore it all day', 4, 'true'], ['Slightly loose at the waist but looks good', 4, 'large']
];
const REVIEWERS = ['Priya S', 'Rohan K.', 'Aisha M.', 'Karan P.', 'Meera J.', 'Vikram T.', 'Sneha R.', 'Arjun D.'];
function reviewsFor(p) {
  const n = parseInt(p.id.slice(1), 10);
  return Array.from({ length: 6 }, (_, k) => {
    const r = REVIEW_BANK[(n + k * 3) % REVIEW_BANK.length];
    return { id: `${p.id}-r${k}`, name: REVIEWERS[(n + k) % REVIEWERS.length], stars: r[1], text: r[0], fit: r[2], days: 2 + k * 5 };
  });
}

const RIDERS = [{ name: 'Rahul K.', rating: 4.8 }, { name: 'Imran S.', rating: 4.9 }, { name: 'Divya N.', rating: 4.7 }];
const PROMOS = {
  ZIPPY50: { label: '₹50 off on orders above ₹999', min: 999, calc: t => 50 },
  FIRST10: { label: '10% off, up to ₹200', min: 0, calc: t => Math.min(200, Math.round(t * 0.1)) }
};
const TRENDING = ['formal blazer', 'kurta set', 'floral dress', 'denim jacket', 'joggers', 'saree'];