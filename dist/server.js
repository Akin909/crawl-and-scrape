'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _scraper = require('./scraper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var PORT = process.env.PORT || 3005;

//app.get('/crawl', getCrawling());

app.get('/scrapings', function (req, res) {
  (0, _scraper.getScrapings)(req, res);
});

app.listen(PORT, function () {
  console.log('Its going on, on port ' + PORT);
});