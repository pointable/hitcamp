define(["app",
  "apps/adventures/list/adventuresList_view",
  "bootbox",
  "bootstrap"
],
    function(CampManager, View, bootbox) {
      CampManager.module("AdventuresApp.ListAdventures",
          function(ListAdventures, CampManager, Backbone, Marionette, $, _) {
            var reqres = new Backbone.Wreqr.RequestResponse();
            ListAdventures.Controller = {
              listAdventures: function(adventuresRegion) {
                //Show the layout and trigger render when needed
                require(["entities/adventure/adventure_collection"], function() {
                  var adventures = CampManager.request("adventure:entities:html");
//                    $.when(fetchingAdventures).done(function(adventures) {
                  showAdventuresView(adventures, adventuresRegion);
//                    });
                });

              },
              listAdventuresWeb: function(adventuresRegion) {
                var fetchingAdventures = CampManager.request("adventure:entities");
                $.when(fetchingAdventures).done(function(adventures) {
                  showAdventuresView(adventures, adventuresRegion);
                });
              }
            };

            function showAdventuresView(adventures, adventuresRegion) {
              adventures.at(0).set("isFirst", true);
              //Register handler to return current adventures collections
              CampManager.reqres.setHandler("adventures", function() {
                return adventures;
              });
              var adventuresView = new View.Adventures({collection: adventures});
              adventuresRegion.show(adventuresView);
              //Set the adventure from the first classroom to selected
              require(["entities/classroom/classroom_collection"], function() {
                var classrooms = CampManager.request("classroom:entities:html");
                var adventureFromClassroom = adventures.get(classrooms.at(0).get("lesson"));
                if (typeof adventureFromClassroom !== 'undefined') {
                  adventureFromClassroom.setSelected();
                }
              });

              adventuresView.on("adventure:new", function() {
                bootbox.prompt("New Adventure Name: ", function(result) {
                  if (result === null) {
                    console.log("empty");
                    return;
                  } else {
                    require(["entities/adventure/adventure_model"], function() {
                      var adventure = CampManager.request("adventure:entity:new");
                      adventure.set("lessonName", result);
                      console.log("adventure %O", adventure);
                      adventures.create(adventure, {at: 0},
                      {
                        wait: true,
                        success: function(e) {
                          console.log("success %O :", e);
                        },
                        error: function(send, res) {
                          console.log("fail : %O", res);
                          bootbox.alert(res.responseJSON.error);
                        }
                      });
                      //classrooms.fetch({data:'',reset:true});
                    });
                    console.log(result);
                  }

                });
              });

              var isMobile = {
                Android: function() {
                  return navigator.userAgent.match(/Android/i);
                },
                BlackBerry: function() {
                  return navigator.userAgent.match(/BlackBerry/i);
                },
                iOS: function() {
                  return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                },
                Opera: function() {
                  return navigator.userAgent.match(/Opera Mini/i);
                },
                Windows: function() {
                  return navigator.userAgent.match(/IEMobile/i);
                },
                any: function() {
                  return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
                }
              };

              adventuresView.on("childview:adventure:edit", function(view) {
                var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
                var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
                var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
                var is_safari = navigator.userAgent.indexOf("Safari") > -1;
                var is_Opera = navigator.userAgent.indexOf("Presto") > -1;
                var is_phantomjs = navigator.userAgent.indexOf("PhantomJS") > -1;
                if ((is_chrome) && (is_safari)) {
                  is_safari = false;
                }
                var isMobileDevice = isMobile.any();

                if ((isMobileDevice || !is_chrome) && !is_phantomjs) {
                  var msg = '<b>Alert! </b><br> The Adventure Editor for the private beta is optimized for <b>Chrome</b> on the desktop'
                      + '<br> There may be missing features in the Adventure Editor with your web browser.';

                  bootbox.confirm(msg, function(result) {
                    if (result) {
                      location.href = view.model.url();
                    }else {
                      
                    }
                  });
                } else {
                  location.href = view.model.url();
                }
              });
              adventuresView.on("childview:adventure:share", function(view) {
                var lessonID = view.model.get('shortID');
                if (!lessonID){
                  lessonID = view.model.get('_id');
                }
                var shareURL = location.href + 'a/' +  lessonID;//view.model.get('_id');
                var lessonName = view.model.get('lessonName');
                var inputText = '<input type="text" id="share-url" name="shareURL" value="' + shareURL
                    + '" readonly style="width:100%" onclick="this.select();">';
                var openLink = '<a href="' + shareURL + '" target="_blank"> Open Link</a>'
                var shareFacebook = '<a href="https://www.facebook.com/sharer/sharer.php?u=' + shareURL
                    + '" target="_blank"> Facebook</a>';
                var shareTwitter = '<a href="http://twitter.com/share?text=Check out this Adventure - ' + view.model.get('lessonName')
                    + '&url=' + shareURL + '&hashtags=hitcamp'
                    + '" target="_blank">  Twitter</a>';
                
                bootbox.alert('<b>Share Adventure: </b>' + lessonName + '<br><br> Link to share: <br>' + inputText
                    + openLink+ '<br><br> Share via ' + shareFacebook + " or " + shareTwitter);
              });
              adventuresView.on("childview:adventure:duplicate", function(view) {
                $.ajax({
                  url: '/adventures/edit/' + view.model.get('_id') + '/clone',
                  type: 'POST',
                  data: "",
                  success: function(response) {
                    CampManager.trigger("adventures:list:web");
                    adventures.fetch({data: ''});
                  }
                });
              });
              adventuresView.on("childview:adventure:delete", function(view) {
                var string = "Delete " + view.model.get("lessonName") + " ?";
                bootbox.confirm(string, function(result) {
                  if (result) {
                    view.model.destroy();
                  } else {
//                    console.log(result);
                    return;
                  }
                });
              });

              adventuresView.on("childview:adventure:activate", function(view) {

//                console.log("adventure activate");
                var classrooms = CampManager.request("classrooms");
                var activeClassroom = classrooms.findWhere({selected: true});
//                console.log("active campus %O", activeClassroom);
//                console.log("classrooms %O", classrooms);
                var currentAdventure = view.model.get("_id");
                var classroomAdventure = activeClassroom.get('lesson');
                //If the current adventure is the same with the active classroom
                //adventure, then deselect it and assign it blank
                var lessonName = view.model.get("lessonName");
                var msg;
                if (currentAdventure !== classroomAdventure) {
                  msg = "Assign <b>" + lessonName + "</b> to <b>" + activeClassroom.get("name") + "</b>?";
                } else {
                  msg = "Unassigned <b>" + lessonName + "</b> from <b>" + activeClassroom.get("name") + "</b>?";
                }

                bootbox.confirm(msg, function(val) {
                  if (val) {
                    if (currentAdventure !== classroomAdventure) {
                      $.ajax({
                        url: '/classrooms/' + activeClassroom.get('_id') + '/',
                        type: 'PUT',
                        data: "idLesson=" + view.model.get("_id"),
                        success: function(response) {
                          activeClassroom.set({
                            backgroundThumbnailURL: view.model.get("backgroundThumbnailURL"),
                            lesson: view.model.id,
                            lessonName: lessonName
                          });
                        }
                      });
                      view.model.setSelected();
                    } else {
                      $.ajax({
                        url: '/classrooms/' + activeClassroom.get('_id') + '/',
                        type: 'PUT',
                        data: "idLesson=" + '',
                        success: function(response) {
                          activeClassroom.set({
                            backgroundThumbnailURL: 'about:blank',
                            lesson: ''
                          });
                        }
                      });
                      view.model.set("selected", false);
                    }
                  }
                });


              });

            }

            function showCampView(activities) {
              reqres.setHandler("activities", function() {
                return activities;
              });
            }
          });
      return CampManager.AdventuresApp.ListAdventures.Controller;
    });


