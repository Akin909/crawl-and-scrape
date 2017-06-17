import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getScrapings } from './scraper';

const app = express();
const PORT = process.env.PORT || 3005;

app.use('*', cors({ origin: 'http://localhost:3000' }));

//app.get('/crawl', getCrawling());

app.get('/scrapings', (req, res) => {
  getScrapings(req, res);
});

app.listen(PORT, () => {
  console.log(`Its going on!! at port ${PORT}`);
});
