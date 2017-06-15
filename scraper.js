const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const promisify = (fn, args) => {
  new Promise((resolve, rej) => {
    return fn(args, (err, res) => {
      if (err) {
        return rej(err.message);
      }
      return resolve(res);
    });
  });
};

[
  {
    url: 'https://news.ycombinator.com/news',
    output: 'hackernews.txt',
    handler: getNews
  },
  {
    url: 'https://news.ycombinator.com/jobs',
    output: 'hackernewsJobs.txt',
    handler: getJobs
  }
].forEach(topic => {
  axios(topic.url).then(res =>
    parseHtml(res.data, topic.output, topic.handler)
  );
});

const parseHtml = (htmlString, output, parseFn) => {
  const ch = cheerio.load(htmlString);
  fs.appendFileSync(output, `Date: ${new Date().getDate()}'\n\n'`);
  parseFn(ch, output);
};

function getNews(ch, output) {
  ch('tr.athing:has(td.votelinks)').each(function(index) {
    const title = ch(this).find('td.title > a').text().trim();
    const link = ch(this).find('td.title > a').attr('href');
    fs.appendFileSync(output, title + '\n' + link + '\n\n');
  });
}

function getJobs(ch, output) {
  ch('tr.athing').each(index => {
    const job = ch(this).find('td.title > a').text().trim();
    console.log('job', job, 'this', this);
  });
}
