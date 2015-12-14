define(["app",
  "apps/classrooms/list/classroomsList_view",
  "bootbox",
  "bootstrap"
],
    function(CampManager, View, bootbox) {
      CampManager.module("ClassroomsApp.ListClassrooms",
          function(ListClassrooms, CampManager, Backbone, Marionette, $, _) {
//            var classroomsReqres = new Backbone.Wreqr.RequestResponse();
            ListClassrooms.Controller = {
              listClassrooms: function(classroomsRegion) {
                //Show the layout and trigger render when needed
                require(["entities/classroom/classroom_collection"], function() {
                  var classrooms = CampManager.request("classroom:entities:html");
                  require(["entities/adventure/adventure_collection"], function() {
                    var adventures = CampManager.request("adventure:entities:html");
                    _.each(classrooms.models, function(classroom) {
                      var lessonID = classroom.get("lesson");
                      if (lessonID !== "" && typeof lessonID !== 'undefined') {
                        var adventure = adventures.get(lessonID);
                        if (typeof adventure !== 'undefined') {
                          classroom.set("backgroundThumbnailURL", adventure.get("backgroundThumbnailURL"));
                          classroom.set("lessonName", adventure.get("lessonName"));
                        }
                      } else {
                        classroom.set("backgroundThumbnailURL", "about:blank");
                        classroom.set("lessonName", "");
                      }
                    });
                    showClassroomsView(classrooms, classroomsRegion);
                  });
//                    $.when(fetchingClassrooms).done(function(classrooms) {

//                    });
                });
              }
            };
            function showClassroomsView(classrooms, classroomsRegion) {
              classrooms.at(0).set("isFirst", true);
              //Register handler to return current classrooms collection
              CampManager.reqres.setHandler("classrooms", function() {
                return classrooms;
              });
              var classroomsView = new View.Classrooms({collection: classrooms});
              classroomsRegion.show(classroomsView);
              //Set the first classroom to active              
              classrooms.at(0).setSelected();


              classroomsView.on("classroom:new", function() {
                
                newClassroom("");
                function newClassroom(a) {
                  bootbox.prompt({
                    title: "New Classroom Name: ( Minimum 6 characters )",
                    value: a,
                    callback: function(result) {
                      if (result === null) {
                        console.log("empty");
                        return;
                      } else {
                        require(["entities/classroom/classroom_model"], function() {
                          var classroom = CampManager.request("classroom:entity:new");
                          classroom.set("name", result);                          
                          console.log("classroom %O", classroom);
                          classrooms.create(classroom,
                              {
                                wait: true,
                                success: function(model, res) {
//                              console.log("success",model);
                                  console.log("success message", res);
                                },
                                error: function(model, err) {
//                              console.log("model",model);
//                              console.log("err",err.responseJSON.errors[0]);
                                  bootbox.alert(err.responseJSON.errors[0], function() {
                                    newClassroom(result);
                                  });
                                }
                              });
                          // classrooms.fetch({data: '', reset: true});
                        });
                      }
                    }
                  });





                }

              });
              classroomsView.on("childview:classroom:launch", function(view) {
                location.href = view.model.get("path");
              });
              classroomsView.on("childview:classroom:activate", function(view) {
                view.model.setSelected();
                var adventures = CampManager.request("adventures");
                var selectAdventure = adventures.get(view.model.get("lesson"));
                selectAdventure.setSelected();
              });
            }

            function showCampView(activities) {
              reqres.setHandler("activities", function() {
                return activities;
              });
            }
          });
      return CampManager.ClassroomsApp.ListClassrooms.Controller;
    });


