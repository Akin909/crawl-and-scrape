const axios = require('axios');
const cheerio = require('cheerio');
const URL = require('url-parse');

const startURL = 'http://www.arstechnica.com';
const searchWord = 'react';
const maxPagesToVisit = 10;
//const pagesVisited = {};
//const pagesToVisit = [];
//let numPagesVisited = 0;
const url = new URL(startURL);
const baseUrl = url.protocol + '//' + url.hostname;

const config = {
  searchWord,
  max: 10,
  pagesToVisit: [startURL],
  pagesVisited: {},
  numPagesVisited: 0
};
crawl(config);

function crawl(config) {
  //const { max, pagesVisited, pagesToVisit, numPagesVisited } = config;
  if (config.numPagesVisited >= config.max) {
    return console.log('Reached max limit of number of pages to visit');
  }
  let nextPage = config.pagesToVisit.pop();
  console.log('Visiting page', nextPage);
  if (nextPage in config.pagesVisited) {
    //Page already visited so continue crawl
    console.log('nextPage', nextPage);
    crawl(config);
  } else {
    //new page
    visitPage(nextPage, config, crawl);
  }
}

function searchForWord(ch, word) {
  const bodyText = ch('html > body').text();
  return bodyText.toLowerCase().indexOf(word.toLowerCase() !== -1);
}

function visitPage(url, config, fn) {
  config.pagesVisited[url] = true;
  config.numPagesVisited++;
  axios(url)
    .then(res => {
      const ch = cheerio.load(res.data);
      let isWordFound = searchWord(ch, config.searchWord);
      console.log('Page title: ', ch('title').text());
      if (isWordFound) {
        console.log(`Word: ${config.searchWord} found at ${url}`);
      } else {
        console.log('collectInternalLinks');
        collectInternalLinks(ch, config);
        fn(config);
      }
    })
    .catch(e => fn(config));
}

function collectInternalLinks(ch, config) {
  const allRelativeLinks = [];
  const allAbsoluteLinks = [];

  const relativeLinks = ch('a[href^="/"]');
  relativeLinks.each(function() {
    allRelativeLinks.push(ch(this).attr('href'));
    config.pagesToVisit.push(baseUrl + ch(this).attr('href'));
    console.log('pages', config.pagesToVisit);
  });

  const absoluteLinks = ch('a[href^="http"]');
  absoluteLinks.each(function() {
    allAbsoluteLinks.push(ch(this).attr('href'));
  });
  console.log(`Found: , ${allRelativeLinks.length} relative links`);
  console.log(`Found: , ${allAbsoluteLinks.length} absolute links`);
}
