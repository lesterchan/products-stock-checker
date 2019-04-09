'use strict';

const cheerio = require('cheerio');

const { fetchPageContents, writeDataFile } = require('./helper');

const storeUrl = 'https://www.razer.com';
const storesJsonFile = 'data/razer-stores.json';

(async () => {
  const storesData = {
    oosElement: '.cta-with-price button.out-stock',
    priceElement: '.sub-menu-price-panel .cost',
    stores: [],
  };

  const pageHtml = await fetchPageContents(storeUrl);
  const $ = cheerio.load(pageHtml);
  $('.container_sec ul li').each((i, elem) => {
    const storeElement = $(elem).children('a');
    let storeCountry = $(elem).children('a').text();
    const parentCountry = $(elem).parent('ul.sub-ul');
    if (parentCountry.length > 0) {
      storeCountry = `${storeCountry} (${parentCountry.prev('a').text()})`;
    }

    let localStoreUrl = storeElement.attr('href');
    if (localStoreUrl.startsWith('/')) {
      localStoreUrl = storeUrl + localStoreUrl;
    }
    if (!localStoreUrl.endsWith('/')) {
      localStoreUrl = `${localStoreUrl}/`;
    }
    if (localStoreUrl.startsWith('https')) {
      storesData.stores.push({ name: `Razer ${storeCountry} Online Store`, url: localStoreUrl });
    }
  });

  writeDataFile(storesJsonFile, storesData);
})();
