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

const sites = [
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
];
const data = sites.map(topic =>
  axios(topic.url).then(res => parseHtml(res.data, topic.output, topic.handler))
);

function append(output, data, link) {
  fs.appendFileSync(output, `${data}\n ${link}\n\n`);
}

const parseHtml = (htmlString, output, parseFn) => {
  const ch = cheerio.load(htmlString);
  fs.writeFileSync(output, `Date: ${new Date().toLocaleTimeString()}\n\n`);
  return parseFn(ch, output);
};

function getNews(ch, output) {
  ch('tr.athing:has(td.votelinks)').each(function(index) {
    const title = ch(this).find('td.title > a').text().trim();
    const link = ch(this).find('td.title > a').attr('href');
    append(output, title, link);
    return {
      title,
      link
    };
  });
}

function getJobs(ch, output) {
  ch('tr.athing:has(td.title)').each(function(index) {
    const job = ch(this).find('td.title > a').text().trim();
    const jobLink = ch(this).find('td.title > a').attr('href');
    append(output, job, jobLink);
    return {
      job,
      jobLink
    };
  });
}
