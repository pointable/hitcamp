var PLUGIN_NAME = 'CHECK_IN';
var clicked = false;

$(document).ready(function() {
  $(function() {
    FastClick.attach(document.body);
  });

  if (parent.isTeacher) {
  } else {//student
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      var messageReceived = param.detail;

      switch (messageReceived.pluginMessageType)
      {
        case 'ResetActivity':
          processResetActivity(messageReceived.data);
          break;
        case 'SetActivityResult':
          processSetActivityResult(messageReceived.data);
          break;
      }
    });
    
    $(document).on('click', 'a', function(event) {
      var selection = parseInt($(event.target).attr('id'));            
      parent.pluginToServer(PLUGIN_NAME, 'CheckInSubmitted', {selection: selection});
      
      for (var i=1; i<= 5; i++){        
        if (i <= selection){
          $("#"+i).addClass("btn-success");
          $("#"+i).removeClass("btn-default");
        }else {          
          $("#"+i).addClass("btn-default");
          $("#"+i).removeClass("btn-success");
        }
      }
    });
  }

  parent.pluginToServer(PLUGIN_NAME, 'StudentOpen', {});
});

function processResetActivity(data) {
}

function ResetActivity(data) {
}

function processSetActivityResult(data) {
}
