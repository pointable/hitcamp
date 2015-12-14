'use strict';
var url = require('url');

exports.port = process.env.PORT || 3000;
exports.mongodb = {
  uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost/drywall'
};
exports.redis = {
  uri: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  host: getHostname(process.env.REDIS_URL),
  port: getPort(process.env.REDIS_URL),
  activated: true
};
exports.companyName = 'Pointable Lab';
exports.projectName = 'Hit.Camp';
exports.systemEmail = 'team@hit.camp';
exports.cryptoKey = 'ldfj6572cd';
exports.loginAttempts = {
  forIp: 50,
  forIpAndUser: 7,
  logExpiration: '20m'
};
exports.requireAccountVerification = true;
exports.smtp = {
  from: {
    name: process.env.SMTP_FROM_NAME || exports.projectName + ' Team',
    address: process.env.SMTP_FROM_ADDRESS || 'team@hit.camp'
  },
  credentials: {
    user: process.env.SMTP_USERNAME || 'team@hit.camp',
    password: process.env.SMTP_PASSWORD || '',
    host: process.env.SMTP_HOST || '',
    ssl: true
  }
};
exports.oauth = {
  twitter: {
    key: process.env.TWITTER_OAUTH_KEY || '',
    secret: process.env.TWITTER_OAUTH_SECRET || ''
  },
  facebook: {
    key: process.env.FACEBOOK_OAUTH_KEY || '',
    secret: process.env.FACEBOOK_OAUTH_SECRET || ''
  },
  github: {
    key: process.env.GITHUB_OAUTH_KEY || '',
    secret: process.env.GITHUB_OAUTH_SECRET || ''
  },
  google: {
    key: process.env.GOOGLE_OAUTH_KEY || '',
    secret: process.env.GOOGLE_OAUTH_SECRET || ''
  },
  tumblr: {
    key: process.env.TUMBLR_OAUTH_KEY || '',
    secret: process.env.TUMBLR_OAUTH_SECRET || ''
  }
};

exports.scopes = {
  google: ['profile email', 
//    'https://www.googleapis.com/auth/photos',
//    'https://www.googleapis.com/auth/drive'
  ]
};

exports.lesson = {
  lessonIDs: [ 
    "53a83119f297a60a006454a3"
//    "537c397a4339e00a00c21700"
//    "539ee70ad63d93b43c3c8e6e" //hit.camp server
  ]
};

function getHostname(address) {
  if (address) {
    var parts = url.parse(address, true);
    if (parts) {
      return parts['hostname'];
    } else {
      return null;
    }
  }
  return null;
}
function getPort(address) {
  if (address) {
    var parts = url.parse(address, true);
    if (parts) {
      return parts['port'];
    } else {
      return null;
    }
  }
  return null;
}
