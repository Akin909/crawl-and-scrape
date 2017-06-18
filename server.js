import express from 'express';
import bodyParser from 'body-parser';
import { getScrapings } from './scraper';

const app = express();
const PORT = process.env.PORT || 3005;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

//app.get('/crawl', getCrawling());

app.get('/scrapings', (req, res) => {
  getScrapings(req, res);
});

app.listen(PORT, () => {
  console.log(`Its going on, on port ${PORT}`);
});
