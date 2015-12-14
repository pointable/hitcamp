'use strict';
var request = require('request');
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
//    console.log("Authenticated");
    return next();
  }
  res.set('X-Auth-Required', 'true');
  req.session.returnUrl = req.originalUrl;
//  console.log("Not Authenticated");
  res.redirect('/login/');
}

function ensureStudent(req, res, next) {
  if (req.user.canPlayRoleOf('student')) {
//    console.log("Not Authenticated");
    return next();
  }
  res.redirect('/' + req.params.path + '/login');
}

function ensureAdmin(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  res.redirect('/');
}

function ensureAccount(req, res, next) {
  if (req.user.canPlayRoleOf('admin')) {
    return next();
  }
  if (req.user.canPlayRoleOf('account')) {
    if (req.app.config.requireAccountVerification) {
      if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
        return res.redirect('/account/verification/');
      }
    }
    return next();
  }
  res.redirect('/');
}


exports = module.exports = function(app, passport) {
//  app.all('/', function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  next();
// });

  //front end


  app.get('/', checkMainPage);
  function checkMainPage(req, res, next) {
    console.log(req.isAuthenticated());
    if (req.isAuthenticated() && req.user.canPlayRoleOf('account')) {
      require('./views/session/indexSession').findSessions(req, res, next);
    } else {
      require('./views/index').init(req, res, next);
    }
  }

  app.get('/about', require('./views/about/index').init);
  app.get('/contact', require('./views/contact/index').init);
  app.post('/contact', require('./views/contact/index').sendMessage);


  var request = require('request');
  app.get('/image_proxy/:imageUrl', function(req, res) {
    var newurl = req.params.imageUrl;
    var reqProxy = request(newurl);
    reqProxy.on('response', function(respProxy) {
      respProxy.headers['cache-control'] = 'public, max-age=31536000';
      delete respProxy.headers['expires'];
    });
    reqProxy.pipe(res);
  });
  app.get('/image/:imageUrl', function(req, res) {
    var newurl = req.params.imageUrl;
    var reqProxy = request(newurl);
    reqProxy.on('response', function(respProxy) {
      respProxy.headers['cache-control'] = 'public, max-age=31536000';
      delete respProxy.headers['expires'];
    });
    reqProxy.pipe(res);
  });
  //lesson session
  app.all('/session*', ensureAuthenticated);
  app.all('/session*', ensureAccount);
  app.all('/classrooms*', ensureAuthenticated);
  app.all('/classrooms*', ensureAccount);

  //Teacher - need login
//  app.get('/sessionTest/:id', require('./views/sessionTest/index').find);   
  //student
  app.get('/join/:path', require('./views/join/indexJoin').find);
//  app.get('/join/:id/teststudents', require('./views/join/indexJoin').teststudents); 
//  app.get('/join/:id/activities', require('./views/join/indexJoin').getActivities); 
//  
  //create new classroom 
  app.post('/session/:idLesson', require('./views/session/indexSession').create);
//  app.get('/session/create/:idLesson', require('./views/session/indexSession').create); 
  app.get('/session/:path', require('./views/session/indexSession').find);
  app.put('/session/:id', require('./views/session/indexSession').update);
  app.delete('/session/:id', require('./views/session/indexSession').delete);
  app.get('/session', require('./views/session/indexSession').findSessions);


  app.post('/classrooms', require('./views/session/indexSession').create);
//  app.get('/camps/create/:idLesson', require('./views/session/indexSession').create); 
//  app.get('/classroom/:path', require('./views/session/indexSession').find); 
  app.get('/classrooms/:path', require('./views/session/indexSession').find);
  app.put('/classrooms/:id', require('./views/session/indexSession').update);
  app.delete('/classrooms/:path', require('./views/session/indexSession').delete);

//  app.get('/classrooms', require('./views/session/indexSession').findSessions); 
  app.get('/classrooms', function(req, res) {
    return res.redirect('/');
  });

  //Classroom > Settings
  app.get('/classrooms/:path/configure', require('./views/session/settings/indexSessionSettings').read);
  app.put('/classrooms/:path/configure', require('./views/session/settings/indexSessionSettings').update);
  app.delete('/classrooms/:path/configure', require('./views/session/indexSession').delete);

  //Classroom > Students
  app.get('/classrooms/:path/students', require('./views/session/students/indexStudents').find);
  app.post('/classrooms/:path/students', require('./views/session/students/indexStudents').create);
  app.get('/classrooms/:path/students/:id', require('./views/session/students/indexStudents').read);
  app.put('/classrooms/:path/students/:id', require('./views/session/students/indexStudents').update);
  app.put('/classrooms/:path/students/:id/password', require('./views/session/students/indexStudents').password);
  app.delete('/classrooms/:path/students/:id', require('./views/session/students/indexStudents').delete);

  //Classroom > Reports
  app.get('/classrooms/:path/reports', require('./views/session/reports/indexReports').read);

  //adventures
  app.all('/adventures/edit*', ensureAuthenticated);
  app.all('/adventures/edit*', ensureAccount);

  //create
  app.post('/adventures/edit', require('./views/adventures/indexLessons').create);

  app.post('/adventures/edit/:id/clone', require('./views/adventures/indexLessons').clone);
  app.get('/adventures/edit/:id/clone', require('./views/adventures/indexLessons').clone);

  //get all
  app.get('/adventures/edit', require('./views/adventures/indexLessons').find);
  //read lesson
  app.get('/adventures/edit/:id', require('./views/adventures/activities/indexActivities').find);
  //update lesson
  app.put('/adventures/edit/:id', require('./views/adventures/indexLessons').update);
  app.patch('/adventures/edit/:id', require('./views/adventures/indexLessons').update);
  //delete lesson
  app.delete('/adventures/edit/:id', require('./views/adventures/indexLessons').delete);

  //specific lesson->activity
//  app.get('/adventures/:id/run/', require('./views/adventures/run/index').init);
  app.get('/adventures/edit/:id/activities', require('./views/adventures/activities/indexActivities').find);
  app.get('/adventures/edit/:id/activities/debug', require('./views/adventures/activities/indexActivities').findDebug);

  app.post('/adventures/edit/:id/activities', require('./views/adventures/activities/indexActivities').create);
  app.get('/adventures/edit/:id/activities/:idActivity', require('./views/adventures/activities/indexActivities').read);
  app.delete('/adventures/edit/:id/activities/:idActivity', require('./views/adventures/activities/indexActivities').delete);
  app.put('/adventures/edit/:id/activities/:idActivity', require('./views/adventures/activities/indexActivities').update);

  //wordLists
  app.get('/adventures/edit/:id/word-lists', require('./views/adventures/wordLists/indexWordLists').find);
  app.get('/adventures/edit/:id/word-lists/debug', require('./views/adventures/wordLists/indexWordLists').findDebug);

  app.post('/adventures/edit/:id/word-lists', require('./views/adventures/wordLists/indexWordLists').create);
  app.get('/adventures/edit/:id/word-lists/:idWordList', require('./views/adventures/wordLists/indexWordLists').read);
  app.delete('/adventures/edit/:id/word-lists/:idWordList', require('./views/adventures/wordLists/indexWordLists').delete);
  app.put('/adventures/edit/:id/word-lists/:idWordList', require('./views/adventures/wordLists/indexWordLists').update);

  //adventure share path
  
  app.all('/login-import/*', ensureAuthenticated);
  app.get('/login-import/*', ensureAccount);
  app.get('/login-import/:id',  require('./views/adventures/shared/indexLessonsShared').redirect);
//  app.get('/a/:id/login', require('./views/adventures/shared/indexLessonsShared').preview);
  
  app.get('/adventures/:id', require('./views/adventures/shared/indexLessonsShared').preview);
  app.get('/adventures/:id/:canonical', require('./views/adventures/shared/indexLessonsShared').preview);
  app.get('/a/:id', require('./views/adventures/shared/indexLessonsShared').preview);
  app.get('/a/:id/:canonical', require('./views/adventures/shared/indexLessonsShared').preview);
  

  //sign up
  app.get('/signup', require('./views/signup/index').init);
  app.get('/getstarted', require('./views/signup/index').init);
  app.post('/signup', require('./views/signup/index').signup);

  //social sign up
  app.post('/signup/social', require('./views/signup/index').signupSocial);
//  app.get('/signup/twitter', passport.authenticate('twitter', { callbackURL: '/signup/twitter/callback/' }));
//  app.get('/signup/twitter/callback', require('./views/signup/index').signupTwitter);
//  app.get('/signup/github', passport.authenticate('github', { callbackURL: '/signup/github/callback/', scope: ['user:email'] }));
//  app.get('/signup/github/callback', require('./views/signup/index').signupGitHub);
//  app.get('/signup/facebook', passport.authenticate('facebook', { callbackURL: '/signup/facebook/callback/', scope: ['email'] }));
//  app.get('/signup/facebook/callback', require('./views/signup/index').signupFacebook);
  app.get('/signup/google', passport.authenticate('google', {callbackURL: '/signup/google/callback/', scope: app.config.scopes.google, prompt: 'select_account'}));
  app.get('/signup/google/callback', require('./views/signup/index').signupGoogle);
//  app.get('/signup/tumblr', passport.authenticate('tumblr', { callbackURL: '/signup/tumblr/callback/' }));
//  app.get('/signup/tumblr/callback', require('./views/signup/index').signupTumblr);

  //login/out
  app.get('/login', require('./views/login/index').init);
  app.post('/login', require('./views/login/index').login);
  app.get('/login/forgot', require('./views/login/forgot/index').init);
  app.post('/login/forgot', require('./views/login/forgot/index').send);
  app.get('/login/reset', require('./views/login/reset/index').init);
  app.get('/login/reset/:email/:token', require('./views/login/reset/index').init);
  app.put('/login/reset/:email/:token', require('./views/login/reset/index').set);
  app.get('/logout', require('./views/logout/index').init);

  //social login
//  app.get('/login/twitter', passport.authenticate('twitter', { callbackURL: '/login/twitter/callback/' }));
//  app.get('/login/twitter/callback', require('./views/login/index').loginTwitter);
//  app.get('/login/github', passport.authenticate('github', { callbackURL: '/login/github/callback/' }));
//  app.get('/login/github/callback', require('./views/login/index').loginGitHub);
//  app.get('/login/facebook', passport.authenticate('facebook', { callbackURL: '/login/facebook/callback/' }));
//  app.get('/login/facebook/callback', require('./views/login/index').loginFacebook);
  app.get('/login/google', passport.authenticate('google', {callbackURL: '/login/google/callback/', scope: app.config.scopes.google, prompt: 'select_account'}));
  app.get('/login/google/callback', require('./views/login/index').loginGoogle);
//  app.get('/login/tumblr', passport.authenticate('tumblr', { callbackURL: '/login/tumblr/callback/', scope: ['profile email'] }));
//  app.get('/login/tumblr/callback', require('./views/login/index').loginTumblr);

  //admin
  app.all('/admin*', ensureAuthenticated);
  app.all('/admin*', ensureAdmin);
  app.get('/admin', require('./views/admin/index').init);

  //admin > users
  app.get('/admin/users', require('./views/admin/users/index').find);
  app.post('/admin/users', require('./views/admin/users/index').create);
  app.get('/admin/users/:id', require('./views/admin/users/index').read);
  app.put('/admin/users/:id', require('./views/admin/users/index').update);
  app.put('/admin/users/:id/password', require('./views/admin/users/index').password);
  app.put('/admin/users/:id/role-admin', require('./views/admin/users/index').linkAdmin);
  app.delete('/admin/users/:id/role-admin', require('./views/admin/users/index').unlinkAdmin);
  app.put('/admin/users/:id/role-account', require('./views/admin/users/index').linkAccount);
  app.delete('/admin/users/:id/role-account', require('./views/admin/users/index').unlinkAccount);
  app.delete('/admin/users/:id', require('./views/admin/users/index').delete);

  //admin > administrators
  app.get('/admin/administrators', require('./views/admin/administrators/index').find);
  app.post('/admin/administrators', require('./views/admin/administrators/index').create);
  app.get('/admin/administrators/:id', require('./views/admin/administrators/index').read);
  app.put('/admin/administrators/:id', require('./views/admin/administrators/index').update);
  app.put('/admin/administrators/:id/permissions', require('./views/admin/administrators/index').permissions);
  app.put('/admin/administrators/:id/groups', require('./views/admin/administrators/index').groups);
  app.put('/admin/administrators/:id/user', require('./views/admin/administrators/index').linkUser);
  app.delete('/admin/administrators/:id/user', require('./views/admin/administrators/index').unlinkUser);
  app.delete('/admin/administrators/:id', require('./views/admin/administrators/index').delete);

  //admin > admin groups
  app.get('/admin/admin-groups', require('./views/admin/admin-groups/index').find);
  app.post('/admin/admin-groups', require('./views/admin/admin-groups/index').create);
  app.get('/admin/admin-groups/:id', require('./views/admin/admin-groups/index').read);
  app.put('/admin/admin-groups/:id', require('./views/admin/admin-groups/index').update);
  app.put('/admin/admin-groups/:id/permissions', require('./views/admin/admin-groups/index').permissions);
  app.delete('/admin/admin-groups/:id', require('./views/admin/admin-groups/index').delete);

  //admin > accounts
  app.get('/admin/accounts', require('./views/admin/accounts/index').find);
  app.post('/admin/accounts', require('./views/admin/accounts/index').create);
  app.get('/admin/accounts/:id', require('./views/admin/accounts/index').read);
  app.put('/admin/accounts/:id', require('./views/admin/accounts/index').update);
  app.put('/admin/accounts/:id/user', require('./views/admin/accounts/index').linkUser);
  app.delete('/admin/accounts/:id/user', require('./views/admin/accounts/index').unlinkUser);
  app.post('/admin/accounts/:id/notes', require('./views/admin/accounts/index').newNote);
  app.post('/admin/accounts/:id/status', require('./views/admin/accounts/index').newStatus);
  app.delete('/admin/accounts/:id', require('./views/admin/accounts/index').delete);

  //admin > statuses
  app.get('/admin/statuses', require('./views/admin/statuses/index').find);
  app.post('/admin/statuses', require('./views/admin/statuses/index').create);
  app.get('/admin/statuses/:id', require('./views/admin/statuses/index').read);
  app.put('/admin/statuses/:id', require('./views/admin/statuses/index').update);
  app.delete('/admin/statuses/:id', require('./views/admin/statuses/index').delete);

  //admin > categories
  app.get('/admin/categories', require('./views/admin/categories/index').find);
  app.post('/admin/categories', require('./views/admin/categories/index').create);
  app.get('/admin/categories/:id', require('./views/admin/categories/index').read);
  app.put('/admin/categories/:id', require('./views/admin/categories/index').update);
  app.delete('/admin/categories/:id', require('./views/admin/categories/index').delete);

  //admin > search
  app.get('/admin/search', require('./views/admin/search/index').find);

  app.post('/admin/msg', require('./views/admin/search/index').message);

  //account
  app.all('/account*', ensureAuthenticated);
  app.all('/account*', ensureAccount);
  app.get('/account', require('./views/account/index').init);

  //account > verification
  app.get('/account/verification', require('./views/account/verification/index').init);
  app.post('/account/verification', require('./views/account/verification/index').resendVerification);
  app.get('/account/verification/:token', require('./views/account/verification/index').verify);

  //account > settings
  app.get('/account/settings', require('./views/account/settings/index').init);
  app.put('/account/settings', require('./views/account/settings/index').update);
  app.put('/account/settings/identity', require('./views/account/settings/index').identity);
  app.put('/account/settings/password', require('./views/account/settings/index').password);
  app.put('/account/settings/guide', require('./views/account/settings/index').guide);

  //account > settings > social
//  app.get('/account/settings/twitter', passport.authenticate('twitter', { callbackURL: '/account/settings/twitter/callback/' }));
//  app.get('/account/settings/twitter/callback', require('./views/account/settings/index').connectTwitter);
//  app.get('/account/settings/twitter/disconnect', require('./views/account/settings/index').disconnectTwitter);
//  app.get('/account/settings/github', passport.authenticate('github', { callbackURL: '/account/settings/github/callback/' }));
//  app.get('/account/settings/github/callback', require('./views/account/settings/index').connectGitHub);
//  app.get('/account/settings/github/disconnect', require('./views/account/settings/index').disconnectGitHub);
//  app.get('/account/settings/facebook', passport.authenticate('facebook', { callbackURL: '/account/settings/facebook/callback/' }));
//  app.get('/account/settings/facebook/callback', require('./views/account/settings/index').connectFacebook);
//  app.get('/account/settings/facebook/disconnect', require('./views/account/settings/index').disconnectFacebook);
  app.get('/account/settings/google', passport.authenticate('google', {callbackURL: '/account/settings/google/callback/', scope: app.config.scopes.google, prompt: 'select_account'}));
  app.get('/account/settings/google/callback', require('./views/account/settings/index').connectGoogle);
  app.get('/account/settings/google/disconnect', require('./views/account/settings/index').disconnectGoogle);
//  app.get('/account/settings/tumblr', passport.authenticate('tumblr', { callbackURL: '/account/settings/tumblr/callback/' }));
//  app.get('/account/settings/tumblr/callback', require('./views/account/settings/index').connectTumblr);
//  app.get('/account/settings/tumblr/disconnect', require('./views/account/settings/index').disconnectTumblr);

//  app.post('/classroom', require('./views/session/indexSession').create);
//  app.get('/classroom/create/:idLesson', require('./views/session/indexSession').create); 


//  app.get('/playground', require('./views/session/indexSessionPlayground').createPlayground);  
//  app.get('/playground/:idNumber', require('./views/session/indexSession').teststudents);

  //Student sign up
  app.get('/:path/login', require('./views/studentLogin/indexStudentLogin').init);
  app.post('/:path/signup', require('./views/studentLogin/indexStudentLogin').signup);
  app.post('/:path/login', require('./views/studentLogin/indexStudentLogin').login);
  app.get('/:path/logout', require('./views/studentLogin/indexStudentLogin').logout);

  app.all('/:path/teststudents*', ensureAuthenticated);
  app.all('/:path/teststudents*', ensureAccount);

  app.get('/:path/teststudents/:idNumber', require('./views/session/indexSession').teststudents);

  app.get('/classroom/preview/:idLesson/teststudents/:idNumber', require('./views/session/indexSession').preview);

  app.all('/:path/teacher', ensureAuthenticated);
  app.all('/:path/teacher', ensureAccount);

  app.get('/:path/teacher', processTeacher);

  function processTeacher(req, res, next) {
    return res.redirect('/' + req.params.path);
  }

  app.get('/:path/student', require('./views/join/indexJoin').find);
  app.get('/:path/guest', require('./views/join/indexJoin').find);
  

  app.all('/:path', checkUser);
//  app.get('/:id', require('./views/join/indexJoin').find); 

  function checkUser(req, res, next) {
    if (req.isAuthenticated() && req.user.canPlayRoleOf('account')) {
      require('./views/session/indexSession').find(req, res, next);
    } else {
//      console.log("Not Account: " + req.user);
      if (req.isAuthenticated() && req.user.canPlayRoleOf('student')) {
//        console.log("Is Student" + req);
        require('./views/join/indexJoin').find(req, res, next);
      } else {
//        console.log("Not Student" + req.isAuthenticated());
        require('./views/studentLogin/indexStudentLogin').init(req, res, next);
      }
    }
//    return next();
  }

  app.get('/queue/multi-doer.php', function(req, res, next) {
//    console.log(req.connection.remoteAddress);
    next(null);
  });
  
  //paypal
  app.post('/npi/132', require('./views/account/payment/indexIPN').transaction);
  
//  app.put('/classroom/:id', require('./views/session/indexSession').update); 
//  app.delete('/classroom/:id', require('./views/session/indexSession').delete); 
//  app.get('/classroom', require('./views/session/indexSession').findSessions); 

  //route not found
  app.all('*', require('./views/http/index').http404);
}
;
