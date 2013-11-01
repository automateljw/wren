var http = require("http");
var fs = require("fs");
var Topsy = require('node-topsy');
var requestHandler = require("./request_handler.js");
var scrapers = require("./scrapers.js");

var port = 8080;
var ip = "127.0.0.1";

var server = http.createServer(requestHandler.eventHandler);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);

// Using setInterval() for scraping since cronJob cannot schedule by the second
setInterval(scrapers.scrapeTweets, 6000);  // Twitter API Rate Limit is 180 requests per 15 min
setInterval(scrapers.scrapeMtGox, 30500);  // MtGox API Rate Limit is once per 30s