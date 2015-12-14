'use strict';

//dependencies
var config = require('./config'),
    express = require('express'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    RedisStore = require('connect-redis')(session),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    mongoose = require('mongoose'),
//    slash   = require('express-slash'),
    helmet = require('helmet'),
    connect = require('connect'),
    errorhandler = require('errorhandler');

//create express app
var app = express();

//keep reference to config
app.config = config;
//Setting up the environment for the app depends on config
//console.log(app.settings.env);

//setup the web server
app.server = http.createServer(app);
console.log(config.redis.port);
console.log(config.redis.host);
var redis = require('redis').createClient(config.redis.port, config.redis.host);
app.redis = redis;

//setup mongoose
//console.log(config.mongodb.uri);
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function() {
  //and... we have a data store
});

//config data models
require('./models')(app, mongoose);



//config express in all environments
//app.configure(function(){
//settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//middleware
app.use(require('morgan')('dev'));
app.use(require('compression')());
//app.use(express.favicon(__dirname + '/public/favicon.ico'));
//app.use(require('serve-static')(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'production') {
//  var cacheContents = false;
  var cacheContents = {
    content: {
      max: 1024 * 1024 * 64, // how much memory to use on caching contents
      maxAge: 1000 * 60 * 30, // how long to cache contents for
    }};
  app.use(require('st')({
    url: '/',
    path: path.resolve(__dirname, 'public'),
    index: false,
    cache: cacheContents,
    passthrough: true
  }));
} else {
  app.use(require('serve-static')(path.join(__dirname, 'public')));
}



app.use(require('body-parser')());
//app.use(express.json());
app.use(require('method-override')());
app.use(require('cookie-parser')());

if (config.redis.activated) {
  var options = {url: config.redis.uri};
  app.sessionStore = new RedisStore(options);
//  console.log(app.sessionStore);
} else {
  var options = {url: config.mongodb.uri, auto_reconnect: true};
  app.sessionStore = new mongoStore(options, function(ret) {
    //database ready
    continueLoad();
  });
}

app.use(session({
  secret: config.cryptoKey,
  store: app.sessionStore,
  cookie: {maxAge: 7 * 24 * 3600 * 1000}   //1 week
}));
app.use(passport.initialize());
app.use(passport.session());
app.get(function(req, res, next) {
  if (req.url.substr(-1) == '/' && req.url.length > 1)
    res.redirect(301, req.url.slice(0, -1));
  else
    next();
});
app.use(function(req, res, next) {
  req.getUrl = function() {
    return req.get('host') + req.originalUrl;
  }
  req.getHost = function() {
    return req.protocol + '://' + req.get('host');
  }
  return next();
});

app.use(function(req, res, next) {
  req.getUrl = function() {
    return req.get('host') + req.originalUrl;
  }
  req.getHost = function() {
    return req.protocol + '://' + req.get('host');
  }
  return next();
});
//  helmet.defaults(app);
//  helmet.defaults(app, { xframe: false });
//  app.use(helmet.xframe('sameorigin'));

//response locals
app.use(function(req, res, next) {
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  res.locals.user.email = req.user && req.user.email;
  next();
});

//mount the routes
//app.use(app.router);  

//  app.use(slash());

//error handler
app.use(require('./views/http/index').http500);

//global locals
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'breakcache3';
app.locals.versionNumber = require('./package.json').version;
app.locals.restartDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
//});

//config express in dev environment
//app.configure('development', function(){
//  app.use(express.errorHandler());
//});
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler());
}

//setup passport
require('./passport')(app, passport);


//setup routes
require('./routes')(app, passport);

//custom (friendly) error handler
app.use(require('./views/http/index').http500);

//middleware for caching header
//app.use(function(req, res, next) {
////  if(req.url.substr(-1) == '/' && req.url.length > 1){
////    
////  }
//  
//  res.headers['cache-control'] = 'public, max-age=333'; 
//  
//  next();
//});

//setup utilities
app.utility = {};
app.utility.sendmail = require('./modules/drywall-sendmail');
app.utility.slugify = require('./modules/drywall-slugify');
app.utility.workflow = require('./modules/drywall-workflow');

if (config.redis.activated) {
  continueLoad();
}

function continueLoad() {

  //listen up
  app.server.listen(app.config.port, function() {
    console.log("Server running!");
  });

  if (redis) {
    console.log("Redis Defined");
  } else {
    console.log("Redis Undefined");
  }
  if (app.db) {
    console.log("Mongo Defined");
  } else {
    console.log("Mongo Undefined");
  }
  //create default session
  app.Session = require('./backend/session');
  app.sessions = {};
  //app.sessions['5322acef72aaa29010ab214c'] = session; //pin 3687


  //create instances of each session from database
  app.db.models.Classroom.find({}, function(err, classrooms) {
    console.log("##########  Initializing Sessions    ##########");
    classrooms.forEach(function(classroom) {
      console.log(classroom.path);
      app.sessions[classroom._id] = new app.Session(classroom._id, classroom.lesson, redis, app.db);
    });
    console.log("##########  Sessions Initialized    ##########");
  });

  app.db.models.Lesson.findById(app.config.lesson.lessonIDs[0], function(err, lesson) {
    console.log("Loaded Hit.Camp Walkthrough Data");
    app.config.lesson.backgroundThumbnailURL = lesson.backgroundThumbnailURL;
    app.config.lesson.lessonName = lesson.lessonName;
  });
  //create session for every session store;

  app.sessionServer = require('./backend/socket_server');
  app.sessionServer.listen(app.server, app);

  process.on('uncaughtException', function(err) {
    console.log("UNCAUGHT EXCEPTION ");
    console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);

    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    var hostname = "";

    if (process.env.SERVER_HOSTNAME) {
      hostname = process.env.SERVER_HOSTNAME;
    }

    var options = {
      from: 'team@hit.camp',
      to: 'team@hit.camp',
      subject: 'Server Error - ' + process.env.NODE_ENV + "-" + hostname,
      text: err.stack || err.message
    }
    var emailjs = require('emailjs/email');
    var emailer = emailjs.server.connect(app.config.smtp.credentials);
    emailer.send({
      from: options.from,
      to: options.to,
      'reply-to': options.replyTo || options.from,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      text: options.text,
//      attachment: attachements
    }, function(err, message) {
      if (err) {
        console.log('Email: Error Notice failed to send. ' + err);
        return;
      }
      else {
        console.log("Email: Error Notice sent");
        return;
      }
    });
    //should restart app
  });
}

