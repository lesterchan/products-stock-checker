'use strict';

const cheerio = require('cheerio');

const { fetchPageContents, writeDataFile } = require('./helper');

const razerUrl = 'https://www.razer.com';
const storeSlug = '/store';
const productJsonFile = '../data/razer-products.json';
const productLinkElement = 'a.gtm_learn_more';
const productParentLinkElement = 'ul.text-16.collapsible-menu li.text-16 a';

const fetchProductParentLinks = async (storeUrl, parentLinkElement) => {
  const pageHtml = await fetchPageContents(storeUrl);
  const $ = cheerio.load(pageHtml);
  const data = [];
  $(parentLinkElement).each(async (i, elem) => {
    const productParentLink = $(elem).attr('href');
    const productParentName = $(elem).text().trim();
    if (productParentLink === storeSlug) {
      return;
    }
    data.push({ name: productParentName, link: productParentLink, products: [] });
  });

  return data;
};

const fetchProductLinks = async (parentLink, linkElement) => {
  const productPageHtml = await fetchPageContents(parentLink);
  const $productPage = cheerio.load(productPageHtml);
  const data = [];
  $productPage(linkElement).each((index, element) => {
    const productLink = $productPage(element).attr('href');
    const productName = $productPage('h2', element).text().trim();
    if (productLink.startsWith('#')) {
      return;
    }
    data.push({ name: productName, link: productLink });
  });

  return data;
};

(async () => {
  const productParentLinks = await fetchProductParentLinks(razerUrl + storeSlug, productParentLinkElement);
  const productsPromises = productParentLinks.map(async (productParent) => {
    const products = await fetchProductLinks(razerUrl + productParent.link, productLinkElement);
    productParent.products = products;
    return productParent;
  });

  Promise.all(productsPromises).then((productsData) => {
    writeDataFile(productJsonFile, productsData);
  });
})();
