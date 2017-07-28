// config
var config = require('./config/config.js');

// web server setup
var express = require('express');
var app = express();
var server  = require('http').createServer(app);
const bodyParser= require('body-parser');

fs = require('fs');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// serve static content from public directory
app.use(express.static('public'))

// parse json body when posted
app.use(bodyParser.json());

// dynamically include routes (controllers)
fs.readdirSync('./controllers').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      route = require('./controllers/' + file);
      // TODO figure out how to add these without breaking original
      //route = require('./controllers/api/' + file);
      route.controller(app);
  }
});

// dynamically include routes (controllers)
fs.readdirSync('./controllers/api').forEach(function (file) {
  if(file.substr(-3) == '.js') {
      routeApi = require('./controllers/api/' + file);
      // TODO figure out how to add these without breaking original
      //route = require('./controllers/api/' + file);
      routeApi.controller(app);
  }
});

server.listen(3005, function() {
  console.log('listening on 3005')
})
