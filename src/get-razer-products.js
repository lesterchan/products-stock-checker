'use strict';

const cheerio = require('cheerio');

const { fetchPageContents, writeDataFile } = require('./helper');

const razerUrl = 'https://www.razer.com';
const storeSlug = '/store';
const productJsonFile = 'data/razer-products.json';
const productHeroLinkElement = 'a.categorised-content-latest';
const productLinkElement = 'div.cta a.gtm_learn_more';
const productParentMenuElement = 'ul.menu.level-one';
const productParentLinkElement = 'li.level0.desktop-menu a';

const fetchProductParentLinks = async (storeUrl, parentMenuElement, parentLinkElement) => {
  const pageHtml = await fetchPageContents(storeUrl);
  const $ = cheerio.load(pageHtml);
  const data = [];
  $(parentMenuElement).children().first().find(parentLinkElement)
    .each((i, elem) => {
      const productParentLink = $(elem).attr('href');
      const productParentName = $(elem).text().trim().replace(' New', '');
      if (productParentLink === storeSlug) {
        return;
      }
      if (productParentLink.includes('http')) {
        return;
      }
      data.push({ name: productParentName, link: productParentLink, products: [] });
    });

  return data;
};

const fetchProductLinks = async (parentLink, heroLinkElement, linkElement) => {
  const productPageHtml = await fetchPageContents(parentLink);
  const $productPage = cheerio.load(productPageHtml);
  const data = {};
  $productPage(heroLinkElement).each((index, element) => {
    const productLink = $productPage(element).attr('href').replace('./', '/').replace(razerUrl, '');
    const productName = $productPage(element).children().children().children('h2')
      .text()
      .trim();
    if (productLink.startsWith('#')) {
      return;
    }
    if (productLink.startsWith('javascript')) {
      return;
    }
    if (!data[productName]) {
      data[productName] = productLink;
    }
  });
  $productPage(linkElement).each((index, element) => {
    const productLink = $productPage(element).attr('href');
    const productName = $productPage(element).parent().parent().find('h2')
      .text()
      .trim();
    if (productLink.startsWith('#')) {
      return;
    }
    if (!data[productName]) {
      data[productName] = productLink;
    }
  });

  return data;
};

(async () => {
  const productParentLinks = await fetchProductParentLinks(razerUrl + storeSlug, productParentMenuElement, productParentLinkElement);
  const productsPromises = productParentLinks.map(async (productParent) => {
    const products = await fetchProductLinks(razerUrl + productParent.link.replace(storeSlug, ''), productHeroLinkElement, productLinkElement);
    productParent.products = products;
    return productParent;
  });

  Promise.all(productsPromises).then((productsData) => {
    writeDataFile(productJsonFile, productsData);
  });
})();
