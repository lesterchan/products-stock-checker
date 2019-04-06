'use strict';

const axios = require('axios');
const chalk = require('chalk');
const cheerio = require('cheerio');
const fs = require('fs');

const outOfStockText = 'Out of Stock';
const inStockText = 'In Stock';
const notAvailableText = '-';

const fetchPageContents = async (url) => {
  try {
    const pageContentsRaw = await axios.get(url);
    return pageContentsRaw.data;
  } catch (error) {
    return '';
  }
};

const formatOutput = (store, price, isOutOfStock) => {
  const inStockOrNotAvailable = (price !== notAvailableText ? chalk.green(inStockText) : notAvailableText);
  return {
    Store: store,
    Price: price !== notAvailableText ? chalk.blue(price) : notAvailableText,
    Stock: isOutOfStock ? chalk.red(outOfStockText) : inStockOrNotAvailable,
  };
};

const getPrice = ($, element) => {
  const $element = $(element);
  if ($element.length > 0) {
    return $element.text();
  }

  return notAvailableText;
};

const isOutOfStock = ($, element) => $(element).length > 0;

const processStore = async (priceElement, oosElement, store, productUrl) => {
  try {
    const pageHtml = await fetchPageContents(productUrl);
    const $ = cheerio.load(pageHtml);
    return { store: store.name, price: getPrice($, priceElement), stock: isOutOfStock($, oosElement) };
  } catch (error) {
    console.log(`${store.name} ... ${chalk.yellow(error)}`);
  }
  return {};
};

const writeDataFile = (storesJsonFile, storesData) => {
  fs.writeFile(storesJsonFile, JSON.stringify(storesData), 'utf8', (err) => {
    if (err) {
      console.log(chalk.red(err));
    } else {
      console.log(chalk.green(`Data written to ${storesJsonFile}.`));
    }
  });
};

module.exports = {
  fetchPageContents,
  formatOutput,
  processStore,
  writeDataFile,
};
