'use strict';

// eslint-disable-next-line no-unused-vars
const cTable = require('console.table');

const lazadaStores = require('../data/lazada-stores.json');
const razerStores = require('../data/razer-stores.json');

const { formatOutput, processStore } = require('./helper');

const countrySingapore = 'Singapore';
const razerStoreCoreXSlug = 'gaming-laptops/razer-core-x';

(() => {
  const storesPromises = [];
  [lazadaStores, razerStores].forEach((onlineStore) => {
    onlineStore.stores.forEach((store) => {
      storesPromises.push(processStore(onlineStore.priceElement, onlineStore.oosElement, store, store.productUrl || store.url + razerStoreCoreXSlug));
    });
  });

  Promise.all(storesPromises).then((storesData) => {
    const output = storesData.filter((storeData) => storeData.store.includes(countrySingapore)).map((storeData) => formatOutput(storeData.store, storeData.price, storeData.stock));
    console.table(output);
  });
})();
