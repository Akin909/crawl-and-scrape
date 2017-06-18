import express from 'express';
import bodyParser from 'body-parser';
import { getScrapings } from './scraper';

const app = express();
const PORT = process.env.PORT || 3005;

//app.get('/crawl', getCrawling());

app.get('/scrapings', (req, res) => {
  getScrapings(req, res);
});

app.listen(PORT, () => {
  console.log(`Its going on, on port ${PORT}`);
});
