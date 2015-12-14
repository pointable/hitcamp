'use strict';
var ipn = require('paypal-ipn');


exports.transaction = function(req, res, next) {
  var params = req.body;
  console.log(params);
  
  ipn.verify(params, function callback(err, msg) {
    if (err) {
      console.error(msg);
    } else {
      console.log(msg);
      //Do stuff with original params here

      if (params.payment_status == 'Completed') {
        
        console.log("paid");
        //Payment has been confirmed as completed
      }
    }
  });
};

