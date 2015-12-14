'use strict';

var _ = require('underscore');
var PLUGIN_API = require('../../pluginAPI');
var PLUGIN_NAME = 'WALL_STUDENT';

//var studentWall = [];

function App(idSession, plugins, redis) {

  this.pluginStudentMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'StudentDisconnect':
        break;
      case 'StudentJoin':
        studentJoin(socket, data, this);
        break;
      case 'GetStudentWall':
        getStudentWall(socket, data);
        break;
      case 'Like':
        likePost(socket, data);
        break;
      case 'AddPost':
        clientAddPost(socket, data);
        break;
      default:
    }
  };

  this.pluginTeacherMessageListener = function(socket, pluginMessageType, data) {
    switch (pluginMessageType) {
      case 'GetStudentWall':
        getStudentWall(socket, data);
        break;
      case 'Like':
        likePost(socket, data);
        break;
      case 'AddPost':
        clientAddPost(socket, data);
        break;
      default:
    }
  };

  this.studentWallAddPost = function(data) {
    studentWallAddPost(data);
  }

  function studentWallAddPost(data) {
    var studentID = data.studentID;
    var message = data.message;


    redisAddPost(studentID, data);
  }

  function clientAddPost(socket, data) {
    var studentID = socket.customID;
    redisAddPost(studentID, data);
  }

  function redisAddPost(studentID, data) {
    //redis
    var dataForRedis = {
      postedTime: (new Date()).toJSON(),
      id: (new Date()).toJSON(),
      postData: data.message,
      imageURL: data.imageURL,
      imageData: data.imageData
    };

    dataForRedis = JSON.stringify(dataForRedis);

    if (!redis) {
      console.log("Redis Undefined in ServerWallStudent - RedisAddPost");
      return;
    }
    //add element at the head of list
    redis.lpush("CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + studentID + ":posts", dataForRedis);
  }

  function studentJoin(socket, data) {
    var studentID = socket.customID;

    if (!redis) {
      console.log("Redis Undefined in ServerWallStudent - StudentJoin");
      return;
    }
    redis.exists("CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + studentID + ":posts", function(err, data) {
      if (!data) {
        var dataWallPost = {
          studentID: socket.customID,
          message: socket.customName + " has joined"
        };
        studentWallAddPost(dataWallPost);
      }
    });
  }

  function getStudentWall(socket, data) {
    if (!data || !data.studentID) {
      return;
    }

    if (!redis) {
      console.log("Redis Undefined in ServerWallStudent - getStudentWall");
      return;
    }

    var requestedStudentID = data.studentID;
    var redisWallPostsList = "CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + requestedStudentID + ":posts";
    redis.lrange(redisWallPostsList, 0, 20, function(err, items) {
      if (err) {
        return;
      }
//      console.log(items);
      var wallPosts = [];
      var redisLikesQuery = [];
      _.each(items, function(item) {
        var wallPost = JSON.parse(item);
        var getLikes = "CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + requestedStudentID + ":post:" + wallPost.id + ":likes";
        redisLikesQuery.push(['smembers', getLikes]);
        wallPosts.push(wallPost);
      });

      redis.multi(redisLikesQuery).exec(function(err, replies) {
        if (err) {
          return;
        }
        _.each(replies, function(reply, i) {
          wallPosts[i].likes = reply;
        });

        plugins["SCORE"].studentGetStats(socket, requestedStudentID, function(err, stats) {
          if (err) {
            console.log("ServerWallStudent - Get Stats Error");
            return;
          }
//          console.log(stats);
          var dataToSend = {
            studentID: requestedStudentID,
            wallPosts: wallPosts,
            stats: stats
          };
          PLUGIN_API.SendToSocket(socket, idSession, PLUGIN_NAME,
              'GetStudentWallResponse', dataToSend);
        });

      });
    });

  }



  function likePost(socket, data) {
    if (!data || !data.postID) {
      return;
    }
    var postID = data.postID;
    var requestedStudentID = data.studentID;

    var key = "CAMP:" + idSession + ':' + PLUGIN_NAME + ':' + requestedStudentID + ":post:" + postID + ":likes";

    if (!redis) {
      console.log("Redis Undefined in ServerWallStudent - likePost");
      return;
    }
    redis.SADD(key, socket.customID, function(err, data) {
//      console.log(data);
    });
  }
}
;

module.exports = App;

