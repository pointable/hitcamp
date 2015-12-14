var PLUGIN_NAME = 'WALL_STUDENT';
var selectedStudentID;
$(document).ready(function() {

  initTemplate();
  var parameters = getUrlVars();
  selectedStudentID = parameters.studentID;
  var studentName = parameters.studentName; //get name from body  
//  $("#divName").html("<h2>" + studentName + "</h2>");

  if (parent.isTeacher) {
//    parent.pluginToServer(PLUGIN_NAME, 'TeacherOpen', {});
//listener for messages from server to plugin
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      if (!parent) {
        return;
      }
      var messageReceived = param.detail;
      switch (messageReceived.pluginMessageType)
      {
        case 'GetStudentWallResponse':
          processStudentWall(messageReceived.data);
          break;
      }
    });
    
    parent.pluginToServer(PLUGIN_NAME, 'GetStudentWall', {studentID: selectedStudentID});
    //end teacher
  } else {//student
//
//listener to receive custom plugin server messages 
    $(document).on('ServerToPlugin' + PLUGIN_NAME, function(event, param) {
      if (!parent) {
        return;
      }
      var messageReceived = param.detail;
      switch (messageReceived.pluginMessageType)
      {
        case 'GetStudentWallResponse':
          processStudentWall(messageReceived.data);
          break;
      }
    });
    $("#buttonStar").click(function() {
      parent.pluginToServer(PLUGIN_NAME, 'LikeStudent', {studentID: selectedStudentID});
    });
    parent.pluginToServer(PLUGIN_NAME, 'GetStudentWall', {studentID: selectedStudentID});
  }

  var my_posts = $("[rel=tooltip]");
  var size = $(window).width();
  for (i = 0; i < my_posts.length; i++) {
    the_post = $(my_posts[i]);
    if (the_post.hasClass('invert') && size >= 767) {
      the_post.tooltip({placement: 'left'});
      the_post.css("cursor", "pointer");
    } else {
      the_post.tooltip({placement: 'right'});
      the_post.css("cursor", "pointer");
    }
  }

//  alert($(parent.window).width());
  var screenWidth = $(parent.window).innerWidth();
  if (screenWidth < 500) {
    $("#myChart").attr("width", screenWidth - 80);
    $("#myChart").attr("height", screenWidth - 80);
  } else {
    $("#myChart").attr("width", 500);
    $("#myChart").attr("height", 500);
  }
});
function getUrlVars() {
  var vars = {};
  var frameURL = decodeURIComponent(document.location.href);
//  console.log(frameURL);

  var parts = frameURL.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

function timeSince(date) {
  var postedDate = new Date(date);
  var currentDate = new Date();
  var difference = currentDate - postedDate;
  var seconds = Math.floor((difference) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

var wallPosts;
function processStudentWall(data) {
  $("#imgSpinner").hide();
  processStudentStats(data.stats);
  var fullHTML = "";
  wallPosts = data.wallPosts;
  _.each(wallPosts, function(wallPost, i) {
    wallPost.postedTimeString = timeSince(wallPost.postedTime);
    //check even odd
    if (i % 2 === 0) {
      wallPost.isEven = true;
    }

    if (wallPost.imageData) {
      wallPost.imageData = 'data:image/svg+xml;utf8,' + encodeURIComponent(wallPost.imageData);
    }
    fullHTML += template({wallPost: wallPost});
  });
  fullHTML += '<li class="clearfix" style="float: none;"></li>';
  $(".timeline").html(fullHTML);
  $(".likeButton").click(function(event) {
    event.preventDefault();
    parent.pluginToServer(PLUGIN_NAME, 'Like', {studentID: selectedStudentID, postID: event.target.id});
    var numberOfLikes = $(event.target).attr("value");
    numberOfLikes = parseInt(numberOfLikes) + 1;
    var likesHTML = templateLikes({numberOfLikes: numberOfLikes});
    $(event.target).parent().children(".likesCounter").html(likesHTML);
  });
}
var options = {
  scaleOverride: true,
  scaleStartValue: 0,
  scaleSteps: 5,
  scaleStepWidth: 20,
//  scaleShowLabels: true,
//  scaleLabel: "<%=value%>"
};
var statsCategories = [
  {type: 'ACC', name: 'Accuracy'},
  {type: 'SPD', name: 'Speed'},
  {type: 'ENG', name: 'Engagement'},
  {type: 'SOC', name: 'Social'},
  {type: 'BEH', name: 'Behaviour'}
];

function processStudentStats(stats) {
  var ctx = $("#myChart").get(0).getContext("2d");
  var data = {
    labels: [],
    datasets: [
      {
        fillColor: "rgba(151,187,205,0.5)",
        strokeColor: "rgba(151,187,205,1)",
        pointColor: "rgba(151,187,205,1)",
        pointStrokeColor: "#fff",
        data: []
      }
    ]
  };
  _.each(stats, function(stat) {
    var average = stat.average;
    var categoryName = _.findWhere(statsCategories, {type: stat.category});
    categoryName = categoryName.name;
    
    data.labels.push(categoryName + ": " + average);
    data.datasets[0].data.push(average);
  });
//  data.labels.push("");
//  data.datasets[0].data.push(0);
//  data.labels.push("");
//  data.datasets[0].data.push(0);
//  data.labels.push("");
//  data.datasets[0].data.push(0);


  new Chart(ctx).Radar(data, options);
}

var template, templateLikes;
function initTemplate() {
//  _.templateSettings.variable = "wallPost";
// var values = $( "#templateWallPost" ).html();
  // Grab the HTML out of our template tag and pre-compile it.
  template = _.template($("#templateWallPost").html());
  templateLikes = _.template($("#templateWallPostLikes").html());
}
