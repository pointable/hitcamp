//$(document).ready(function() {
////  return;
//  initTilesProcessor();
//});

var tilesProcessor;

function initTilesProcessor(tilesCollection, activitiesCollection, isUseTitle) {
  tilesProcessor = {};
  tilesProcessor.linkPairs = [];
  tilesProcessor.activityNeighbours = {};

  tilesProcessor.maxX = 9;
  tilesProcessor.maxY = 9;

//  console.log("initTiles Processor");
//  var dataFromHTML = JSON.parse($('#data-results').html());
//  var tiles = dataFromHTML.tiles;
//  var activities = dataFromHTML.activities;
  var tiles = tilesCollection.models;
  var activities = activitiesCollection.models;


  tilesProcessor.tiles2D = new Array(tilesProcessor.maxY);
  for (var i = 0; i < tilesProcessor.maxY; i++) {
    tilesProcessor.tiles2D[i] = new Array(tilesProcessor.maxX);
  }

  tilesProcessor.activities2D = new Array(tilesProcessor.maxY);
  for (var i = 0; i < tilesProcessor.maxY; i++) {
    tilesProcessor.activities2D[i] = new Array(tilesProcessor.maxX);
  }

  //links
  _.each(tiles, function(tile, i) {
    if (i >= 40)
      return;
    
    tilesProcessor.tiles2D[tile.get("y")][tile.get("x")] = tile.get("a");
  });

//  console.log(tiles2);

  //activities
  _.each(activities, function(activity, i) {
    if (!activity)
      return;

    var x = activity.get("x");
    var y = activity.get("y");
    if (!x)
      x = 0;
    if (!y)
      y = 0;
    var activityID = isUseTitle? activity.get("activityTitle"): activity.get("_id");
    tilesProcessor.activities2D[y][x] = activityID; //activityTitle _id
  });
//  console.log(activities2);

//  var start = new Date().getTime();
  processPairs();
//  var end = new Date().getTime();
//  var time = end - start;
//  console.log('Execution time: ' + time);
//  console.log("linkPairs: %O", tilesProcessor.linkPairs);
//  console.log("activityNeighbours: %O", tilesProcessor.activityNeighbours);

  var activityList = []
  _.each(activities, function(activity) {
    
    var activityID = isUseTitle? activity.get("activityTitle"): activity.get("_id");
    activityList.push(activityID); //activityTitle
  });

  tilesProcessor.groups = groupConnected(tilesProcessor.linkPairs,
      tilesProcessor.activityNeighbours, activityList);
//  console.log("Groups: %O", tilesProcessor.groups);
}


//neighbour of the current activity you working on
//var neighbourCollection = activityNeighbours['idsafjlkdsfjl'];

function processPairs() {
  for (var i = 0; i < tilesProcessor.maxY; i++) {
//    console.log(i);
    for (var j = 0; j < tilesProcessor.maxX; j++) {
//      console.log(j);
      var currentActivity = tilesProcessor.activities2D[i][j];
      if (currentActivity) {
        //not null;
        var consoleMessage = currentActivity + " connected to ";
        var neighbours = [];
        checkNeighbours(neighbours, i, j);

        tilesProcessor.activityNeighbours[currentActivity] = [];

        _.each(neighbours, function(neighbour) {
          var activityNeighbour = tilesProcessor.activities2D[neighbour.i][neighbour.j];
          consoleMessage += ", " + activityNeighbour;
          tilesProcessor.linkPairs.push([currentActivity, activityNeighbour]);
          tilesProcessor.activityNeighbours[currentActivity].push(activityNeighbour);
        });
//        console.log(consoleMessage);
      }
    }
  }
}

var up = 1;
var down = 2;
var left = 3;
var right = 4;
function checkNeighbours(neighbours, i, j, previousDirection, previousPositions) {
  if (!previousPositions) {
    previousPositions = []; //initialize
  }
  if (_.findWhere(previousPositions, {i: i, j: j})) {
    return; //came here before
  }
  //add current position
  previousPositions.push({i: i, j: j});

  //go up
  if (i >= (0 + 2) && previousDirection !== down) {
    if (tilesProcessor.tiles2D[i - 1][j + 0]) {
      //check activity at this direction since got link
      var iNext = i - 2;
      var jNext = j + 0;
      if (tilesProcessor.activities2D[iNext][jNext]) {
        //activity present . means found link can stop here
        activityCheckAndAdd(neighbours, previousPositions, iNext, jNext);
      } else {
        //no activity present. check neighbours iterative except this direction
        checkNeighbours(neighbours, iNext, jNext, up, previousPositions);
      }
    }
  }

  //go down
  if (i <= (tilesProcessor.maxY - 2) && previousDirection !== up) {
    if (tilesProcessor.tiles2D[i + 1][j + 0]) {
      var iNext = i + 2;
      var jNext = j + 0;
      if (tilesProcessor.activities2D[iNext][jNext]) {
        activityCheckAndAdd(neighbours, previousPositions, iNext, jNext);
      } else {
        checkNeighbours(neighbours, iNext, jNext, down, previousPositions);
      }
    }
  }

  //go left
  if (j >= (0 + 2) && previousDirection !== right) {
    if (tilesProcessor.tiles2D[i + 0][j - 1]) {
      //check activity
      var iNext = i + 0;
      var jNext = j - 2;
      if (tilesProcessor.activities2D[iNext][jNext]) {
        activityCheckAndAdd(neighbours, previousPositions, iNext, jNext);
      } else {
        checkNeighbours(neighbours, iNext, jNext, left, previousPositions);
      }
    }
  }

  //go right
  if (j <= (tilesProcessor.maxX - 2) && previousDirection !== left) {
    if (tilesProcessor.tiles2D[i + 0][j + 1]) {
      //check activity
      var iNext = i + 0;
      var jNext = j + 2;
      if (tilesProcessor.activities2D[iNext][jNext]) {
        activityCheckAndAdd(neighbours, previousPositions, iNext, jNext);
      } else {
        checkNeighbours(neighbours, iNext, jNext, right, previousPositions);
      }
    }
  }
}

//check the activity whether came here before and add to neighbours array
function activityCheckAndAdd(neighbours, previousPositions, iNext, jNext) {
  if (!_.findWhere(previousPositions, {i: iNext, j: jNext})) {
    neighbours.push({i: iNext, j: jNext});
    previousPositions.push({i: iNext, j: jNext});
  } else {
  }
}


function groupConnected(linkPairs, activityNeighbours, activityList) {
  var groups = [];
  var remainingActivityList = activityList;
  var i = 0;
  while (_.size(remainingActivityList) > 0) {
    var activity = remainingActivityList[0];
    if (!activity) {
      break;
    }
    groups[i] = [];
    groups[i].push(activity); //insert one activity into a new group

//    remainingActivityList = _.without(remainingActivityList, activity);
    remainingActivityList.splice(0, 1);
    //insert neighbours of this activity
    var neighbours = activityNeighbours[activity];

    findAndInsertNeighbours(groups[i], neighbours, remainingActivityList);

    i++;
  }

  return groups;
}

function findAndInsertNeighbours(group, neighbours, remainingActivityList) {
  if (!remainingActivityList || _.size(remainingActivityList) === 0) {
    return;
  }
  _.each(neighbours, function(neighbour) {
    var indexActivity = remainingActivityList.indexOf(neighbour);
    if (indexActivity > -1) {
      activityFound = neighbour;
      group.push(activityFound);

      remainingActivityList.splice(indexActivity, 1);

      var nextNeighbours = tilesProcessor.activityNeighbours[activityFound];
      findAndInsertNeighbours(group, nextNeighbours, remainingActivityList);
    }
  });
}