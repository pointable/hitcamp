'use strict';

exports.init = function(req, res, next){
//  res.render('index', req.user);
  res.render('indexWebAppLanding', req.user);
//, { user: {username: 'testing'}});
};
