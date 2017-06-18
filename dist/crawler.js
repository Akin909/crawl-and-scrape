'use strict';

var axios = require('axios');
var cheerio = require('cheerio');
var URL = require('url-parse');

var startURL = 'http://www.arstechnica.com';
var searchWord = 'react';
var maxPagesToVisit = 10;
var url = new URL(startURL);
var baseUrl = url.protocol + '//' + url.hostname;

var config = {
  searchWord: searchWord,
  max: 10,
  pagesToVisit: [startURL],
  pagesVisited: {},
  numPagesVisited: 0
};
crawl(config);

function crawl(config) {
  if (config.numPagesVisited >= config.max) {
    return console.log('Reached max limit of number of pages to visit');
  }
  console.log('Visiting page', config.pagesToVisit);
  var nextPage = config.pagesToVisit.pop();
  if (nextPage in config.pagesVisited) {
    //Page already visited so continue crawl
    crawl(config);
  } else {
    //new page
    visitPage(nextPage, config, crawl);
  }
}

function searchForWord(ch, word) {
  var bodyText = ch('html > body').text();
  return bodyText.toLowerCase().indexOf(word.toLowerCase() !== -1);
}

function visitPage(url, config, fn) {
  config.pagesVisited[url] = true;
  config.numPagesVisited++;
  axios(url).then(function (res) {
    var ch = cheerio.load(res.data);
    var isWordFound = searchForWord(ch, config.searchWord);
    console.log('Page title: ', ch('title').text());
    if (isWordFound) {
      console.log('Word: ' + config.searchWord + ' found at ' + url);
    } else {
      collectInternalLinks(ch, config);
      fn(config);
    }
  }).catch(function (e) {
    return fn(config);
  });
}

function collectInternalLinks(ch, config) {
  var allRelativeLinks = [];
  var allAbsoluteLinks = [];

  var relativeLinks = ch('a[href^="/"]');
  relativeLinks.each(function () {
    allRelativeLinks.push(ch(this).attr('href'));
    config.pagesToVisit.push(baseUrl + ch(this).attr('href'));
  });

  var absoluteLinks = ch('a[href^="http"]');
  absoluteLinks.each(function () {
    allAbsoluteLinks.push(ch(this).attr('href'));
  });
  console.log('Found: ' + allRelativeLinks.length + ' relative links');
  console.log('Found: ' + allAbsoluteLinks.length + ' absolute links');
}