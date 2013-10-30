var mysql = require('mysql');

var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds
  "Content-Type": "application/json"
};

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'little_bird',
  database : 'little_bird'
});

exports.sendResponse = sendResponse = function(response, obj, status){
  status = status || 200;
  response.writeHead(status, headers);
  response.end(JSON.stringify(obj));
};

var collectData = function(request, callback){
  var data = "";
  request.on('data', function(chunk){
    data += chunk;
  });
  request.on('end', function(){
    callback(data);
  });
};

exports.eventHandler = function(req, res) {
  console.log("Serving request type " + req.method + " for url " + req.url);
  
  switch(req.method) {
    case 'GET':
      res.writeHead(200, headers);
      res.end("GET method received");
      break;
    case 'POST':
      res.writeHead(200, headers);
      res.end("POST method received");
      break;
    case 'OPTIONS':
      res.writeHead(200, headers);
      res.end("OPTIONS method received");
      break;
    default:
      res.writeHead(501, headers);
      res.end('unrecognized request method');
      break;
  }


  
};
