'use strict';

exports = module.exports = function(req, res) {
  var workflow = new (require('events').EventEmitter)();

  workflow.outcome = {
    success: false,
    errors: [],
    errfor: {}
  };

  workflow.hasErrors = function() {
    return Object.keys(workflow.outcome.errfor).length !== 0 || workflow.outcome.errors.length !== 0;
  };

  workflow.on('exception', function(err) {
    workflow.outcome.errors.push('Exception: ' + err);
    return workflow.emit('response');
  });

  workflow.on('response', function() {
    workflow.outcome.success = !workflow.hasErrors();
    res.send(workflow.outcome);
  });

  workflow.on('success', function() {
    workflow.outcome.success = !workflow.hasErrors();
    res.send(workflow.outcome.record);
  });

  workflow.on('error', function() {
//    workflow.outcome.success = !workflow.hasErrors();
    res.json(428, workflow.outcome);
  });

  return workflow;
};
