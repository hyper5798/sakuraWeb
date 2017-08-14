var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');
var routes = require('./routes/index');
var todos = require('./routes/todos');
var http = require('http'),
    https = require('https');
var session = require('express-session');
var settings = require('./settings');
var flash = require('connect-flash');
var JsonFileTools =  require('./models/jsonFileTools.js');
var userPath =  './public/data/user.json';
var moment = require('moment');
var crypto = require('crypto');
var app = express();

var port = process.env.PORT || 3000;
console.log('Server listen port :'+port);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/todos', todos);
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true
}));
app.use('/todos', todos);
routes(app);
var server = http.createServer(app);

try {
		var userObj = JsonFileTools.getJsonFromFile(userPath);
}
catch (event) {
    userObj = {};
}

if(userObj.admin === undefined){
	var md5 = crypto.createHash('md5');
    var	password = md5.update(settings.api_secret).digest('hex');
    userObj.admin = {"name":"admin","password":password,"level":0,"enable":true,"date":moment().format("YYYY/MM/DD hh:mm:ss")};
    JsonFileTools.saveJsonToFile(userPath,userObj);
}

server.listen(port);
