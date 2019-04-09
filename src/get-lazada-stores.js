'use strict';

const { writeDataFile } = require('./helper');

const storeUrlPrefix = 'https://www.lazada.sg/products';
const storesJsonFile = 'data/lazada-stores.json';

(async () => {
  const storesData = {
    oosElement: '.quantity-content-warning',
    priceElement: '.pdp-product-price .pdp-price',
    stores: [
      { name: 'Lazada (Singapore): Official Razer Store', productUrl: `${storeUrlPrefix}/razer-core-x-tb3external-graphics-enclosure-i279418798-s436173823.html` },
      { name: 'Lazada (Singapore): GameProSg', productUrl: `${storeUrlPrefix}/razer-core-x-compatible-with-thunderbolt-3-egpu-lazada-birthday-promo-i278317034-s429804437.html` },
    ],
  };

  writeDataFile(storesJsonFile, storesData);
})();
