'use strict';

// eslint-disable-next-line no-unused-vars
const cTable = require('console.table');
const inquirer = require('inquirer');

const razerProducts = require('../data/razer-products.json');
const razerStores = require('../data/razer-stores.json');

const { formatOutput, processStore } = require('./helper');

const razerAllProducts = razerProducts.reduce((allProducts, product) => Object.assign(allProducts, product.products), {});

const promptProduct = (category) => {
  inquirer
    .prompt([{
      type: 'list',
      name: 'product',
      message: `Choose your Razer product from '${category}':`,
      choices: Object.keys(razerProducts.filter((product) => product.name === category)[0].products),
    },
    ])
    .then((answer) => {
      const storesPromises = [];
      razerStores.stores.forEach((store) => {
        storesPromises.push(processStore(razerStores.priceElement, razerStores.oosElement, store, store.url + razerAllProducts[answer.product]));
      });

      Promise.all(storesPromises).then((storesData) => {
        const output = storesData.map((storeData) => formatOutput(storeData.store, storeData.price, storeData.stock));
        console.table(output);
      });
    });
};

(() => {
  inquirer
    .prompt([{
      type: 'list',
      name: 'category',
      message: 'Choose your Razer product category:',
      choices: razerProducts.map((product) => product.name),
    }]).then((answer) => {
      promptProduct(answer.category);
    });
})();
