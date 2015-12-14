define([
  'jquery',
  'underscore',
  'backbone',
  'app',
  'entities/tile/tile_model'
], function($, _, Backbone, LessonManager, Tile) {
  TileCollection = Backbone.Collection.extend({
    model: Tile,
    url: function() {
      return '/adventures/edit/' + this.idLesson;
    },
    parse: function(results) {
      var init_tiles = initializeTiles();
      _.each(lessonDataFromHtml.tiles, function(tile) {
        var same_tiles = init_tiles.where({
          x: tile.x,
          y: tile.y
        });
        _.each(same_tiles, function(same_tile) {
          same_tile.set({"a": true});
        });

        console.log("same_spot_tiles %O",same_tiles);
      });
      return init_tiles;
    },
    initialize: function(models, options) {
     

      this.idLesson = options;
    }
  });

  var lessonDataFromHtml = JSON.parse($('#data-results').html());
  var idLesson = lessonDataFromHtml._id;

  var tileCollectionFromHtml = function() {

    if (lessonDataFromHtml.tiles === null || typeof lessonDataFromHtml.tiles === "undefined") {
      var init_tiles = initializeTiles();
    } else {
      //Patch the tiles with data from HTML
      var init_tiles = initializeTiles();
//       console.log("init_tiles %O",init_tiles);
//       console.log("lessonDataFromHtml.tiles %O ",lessonDataFromHtml.tiles);
      _.each(lessonDataFromHtml.tiles, function(tile) {
        var same_tiles = init_tiles.where({
          x: tile.x,
          y: tile.y
        });
        _.each(same_tiles, function(same_tile) {
          same_tile.set({"a": true});
        });

//        console.log("same_spot_tiles %O",same_tiles);
      });
    }
    return init_tiles;
  };

  function initializeTiles() {
    var tileCollection = new TileCollection();
    tileCollection.idLesson = idLesson;
    //Initialize the tiles if they are empty    
    //List the link tiles
    //Auto generate the link tiles
    var count_row = 5;
    var count_col = 5;

    var x = 1;
    var y = 0;
    var max_tiles = count_row * 4 + (count_row - 1) * 5;
    for (var i = 0; i < max_tiles; i++) {
      //Links 
      //Odd row
      if (y % 2 === 1) {
        //Next row if 8
        if (x > 0) {
          if (x % 8 === 0) {
            //   console.log("Tiles-> x:" + x + " y: " + y);
            addTile(x, y, "linkver", tileCollection);
            x = 1;//Odd row x starts with 1
            y += 1;
          } else {
            //    console.log("Tiles-> x:" + x + " y: " + y);
            addTile(x, y, "linkver", tileCollection);
            x += 2;
          }
        } else {
          console.log("Tiles-> x:" + x + " y: " + y);
          addTile(x, y, "linkver", tileCollection);
          x += 2;
        }
        //even row
      } else if (y % 2 === 0) {
        //next row if 7
        if (x % 7 === 0) {
          //  console.log("Tiles-> x:" + x + " y: " + y);
          addTile(x, y, "linkhor", tileCollection);
          x = 0;//Even row x starts with 0
          y += 1;
        } else {
          //  console.log("Tiles-> x:" + x + " y: " + y);
          addTile(x, y, "linkhor", tileCollection);
          x += 2;
        }
      }
    }
    //DropZone - Fixed
    var dropPoint_row = 5;
    var dropPoint_col = 5;
    var dropPoint_x = 0;
    var dropPoint_y = 0;
    var dropPoints = dropPoint_row * dropPoint_col;
    for (var i = 0; i < dropPoints; i++) {
      if (dropPoint_x === 0) {
        addTile(dropPoint_x, dropPoint_y, "dropzone", tileCollection);
        dropPoint_x += 2;
        //console.log("dropPoint_x", dropPoint_x + ',' + "dropPoint_y", dropPoint_y);
      } else {
        if (dropPoint_x % 8 === 0) {
          addTile(dropPoint_x, dropPoint_y, "dropzone", tileCollection);
          // console.log("dropPoint_x", dropPoint_x + ',' + "dropPoint_y", dropPoint_y);
          dropPoint_x = 0;
          dropPoint_y += 2;
        } else {
          addTile(dropPoint_x, dropPoint_y, "dropzone", tileCollection);
          //sconsole.log("dropPoint_x", dropPoint_x + ',' + "dropPoint_y", dropPoint_y);
          dropPoint_x += 2;
        }
      }
    }
    console.log(tileCollection);
    return tileCollection;
  }

  function addTile(x, y, type, tileCollection) {
    var title = "link";
    var tile_type = type;
    if (type === "dropzone") {
      title = "dropzone";
      tile_type = "dropzone";
    }
    var tile = new Tile({
      tileTitle: title,
      x: x,
      y: y,
      tileType: tile_type,
      activated: false
    });
//            console.log(x + ', ' + y + ', ' + type);
//            console.log(tile);
    tileCollection.add(tile);
  }

  var API = {
    getTileEntities: function(options) {
      var models = {};
      var tiles = new TileCollection(models, idLesson);
      var defer = $.Deferred();
      tiles.fetch({
        success: function(tiles) {
          defer.resolve(tiles);
        }
      });
      return defer.promise();
    },
    getTileEntitiesFromHTML: function() {
      var tiles = tileCollectionFromHtml();
      return tiles;
    }
  };

  LessonManager.reqres.setHandler("tile:entities", function() {
    return API.getTileEntities();
  });
  LessonManager.reqres.setHandler("tile:entities:initialized", function() {
    return API.getTileEntitiesFromHTML();
  });


  return TileCollection;
});





