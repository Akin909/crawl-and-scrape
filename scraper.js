const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const promisify = require('util.promisify');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

function curry(fn) {
  return function() {
    if (fn.length > arguments.length) {
      const slice = Array.prototype.slice;
      const args = slice.apply(arguments);
      return function() {
        return fn.apply(null, args.concat(slice.apply(arguments)));
      };
    }
    return fn.apply(null, arguments);
  };
}

const Promisify = curry((fn, args) => {
  new Promise((resolve, reject) => {
    return fn(args, (err, res) => {
      if (err) {
        return reject(err.message);
      }
      return resolve(res);
    });
  });
});

const sites = [
  {
    url: 'https://news.ycombinator.com/news',
    output: 'hackernews',
    handler: getNews,
    format: '.txt'
  },
  {
    url: 'https://news.ycombinator.com/jobs',
    output: 'hackernewsJobs',
    handler: getJobs,
    format: '.txt'
  }
];

function append(output, data, link, format) {
  const outputFile = output + format;
  if (!process.env.HEROKU) {
    if (format === '.json') {
      const json = JSON.stringify({ link, data }, null, 2);
      fs.appendFileSync(outputFile, json + `,\n`);
    } else if (format === '.txt') {
      fs.appendFileSync(outputFile, `${data}\n ${link}\n\n`);
    }
  }
  return {
    data,
    link
  };
}

const parseHtml = (htmlString, output, parseFn, format) => {
  const ch = cheerio.load(htmlString);
  return writeFile(
    output + format,
    `Date: ${new Date().toLocaleTimeString()}\n\n`
  ).then(() => parseFn(ch, output));
};

function getNews(ch, output) {
  return ch('tr.athing:has(td.votelinks)')
    .map(function(index) {
      const title = ch(this).find('td.title > a').text().trim();
      const link = ch(this).find('td.title > a').attr('href');
      return append(output, title, link);
    })
    .get();
}

function getJobs(ch, output) {
  return ch('tr.athing:has(td.title)')
    .map(function(index) {
      const job = ch(this).find('td.title > a').text().trim();
      const jobLink = ch(this).find('td.title > a').attr('href');
      return append(output, job, jobLink);
    })
    .get();
}

export function getScrapings(req, res) {
  Promise.all(
    sites.map(topic => {
      const { url, handler, output, format } = topic;
      return axios(url).then(res =>
        parseHtml(res.data, output, handler, format)
      );
    })
  )
    .then(result => res.send(result))
    .catch(e => console.log('error', e));
}
