define(["app", "apps/header/list/headerList_view", "bootbox"], function(LessonManager, View, bootbox) {
  LessonManager.module("HeaderApp.List", function(List, LessonManager, Backbone, Marionette, $, _) {
    List.Controller = {
      listHeader: function(link) {
        var activeLink = link;
        var dataFromHTML = JSON.parse($('#data-results').html());
        var lessonName = dataFromHTML.lessonName;
        var lesson = dataFromHTML;
        document.lessonID = lesson._id;
        var dataClassroomsFromHTML = JSON.parse($('#data-classrooms').html());
        var classrooms = dataClassroomsFromHTML;
//        console.log(classrooms);
//        console.log(lesson._id);
        var model = new Backbone.Model({lessonName: lessonName, classrooms: classrooms, lesson: lesson});
        var headerView = new View.Header({model: model});
        LessonManager.headerRegion.show(headerView);

        this.updateClassroomList(classrooms);

        //Customise the header according to the link click
        //Default active is activities
        if (typeof link === 'undefined' || link === 'null') {
          activeLink = "activities";
        }
        $(".js-nav-" + activeLink).parent().addClass("active");

        headerView.on("header:home", function() {
          console.log("going home");
        });

        headerView.on("header:lessontitle:rename", function(args) {
          console.log("Rename lesson Title");
          bootbox.prompt("Rename Lesson", function(result) {
            if (result === null)
              return;
            args.model.set("lessonTitle", result);
            args.view.$("#inner-lesson-title").html(result);
            console.log(args);
            console.log(result);
          });
        });

        headerView.on("wordLists:list", function(args) {
          LessonManager.trigger("wordLists:list");
        });

        headerView.on("activities:list", function(args) {
          //LessonManager.trigger("activities:list");
          //LessonManager.trigger("activities:list");
          LessonManager.trigger("activities:listAdventures");
        });

        headerView.on("activities:move", function(target) {
          //alert($(args.view.el.target).text());
          console.log("Move");
          console.log(target);
          LessonManager.trigger("activities:move");
        });
        headerView.on("activities:stopmove", function(target) {
          //alert($(args.view.el.target).text());
          console.log("Move");
          console.log(target);
          LessonManager.trigger("activities:stopmove");
        });



        
      },
      listQuestionHeader: function() {
        console.log("list Question Header");
        var model = new Backbone.Model({"test": "test"});
        var headerView = new View.QuestionHeader({model: model});
        LessonManager.headerRegion.show(headerView);
        headerView.on("header:home", function() {
          console.log("going home");
        });

        headerView.on("header:lessontitle:rename", function(args) {
          console.log("Rename lesson Title");
          bootbox.prompt("Rename Lesson", function(result) {
            if (result === null)
              return;
            args.model.set("lessonTitle", result);
            args.view.$("#inner-lesson-title").html(result);
            console.log(args);
            console.log(result);
          });
        });

        headerView.on("header:element:delete", function() {
          console.log("alert box for delete");
          bootbox.confirm("Delete Element", function(result) {
            console.log(result);
          });
        });

        headerView.on("header:element:new", function() {
          console.log("Create new element");
        });

        headerView.on("wordLists:list", function(args) {
          LessonManager.trigger("wordLists:list");
        });

        headerView.on("activities:list", function(args) {
          //LessonManager.trigger("activities:list");
          LessonManager.trigger("activities:listAdventures");
        });
      }, headerViewCommon: function() {

      }, updateClassroomList: function(classrooms) {

        $('.list-group.checked-list-box .list-group-item').each(function() {

          // Settings
          var $widget = $(this),
              $checkbox = $('<input type="checkbox" class="hidden" />'),
              color = ($widget.data('color') ? $widget.data('color') : "primary"),
              style = ($widget.data('style') == "button" ? "btn-" : "list-group-item-"),
              settings = {
                on: {
                  icon: 'glyphicon glyphicon-check'
                },
                off: {
                  icon: 'glyphicon glyphicon-unchecked'
                }
              };

          $widget.css('cursor', 'pointer')
          $widget.append($checkbox);

          // Event Handlers
          $widget.on('click', function() {
            $checkbox.prop('checked', !$checkbox.is(':checked'));
            $checkbox.triggerHandler('change');
            updateDisplay();

            var isChecked = $checkbox.is(':checked');
            console.log(this.id);
            console.log(isChecked);
            var idLesson = "undefined";
            if (isChecked) {
              idLesson = document.lessonID;
            }
            $.ajax({
              url: '/classrooms/' + this.id + '/',
              type: 'PUT',
              data: "idLesson=" + idLesson,
              success: function(response) {
                console.log(response);
//                parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
              }
            });
          });
          $checkbox.on('change', function() {
            updateDisplay();
          });


          // Actions
          function updateDisplay() {
            var isChecked = $checkbox.is(':checked');

            // Set the button's state
            $widget.data('state', (isChecked) ? "on" : "off");

            // Set the button's icon
            $widget.find('.state-icon')
                .removeClass()
                .addClass('state-icon ' + settings[$widget.data('state')].icon);

            // Update the button's color
            if (isChecked) {
              $widget.addClass(style + color + ' active');
            } else {
              $widget.removeClass(style + color + ' active');
            }
          }

          // Initialization
          function init() {

            if ($widget.data('checked') == true) {
              $checkbox.prop('checked', !$checkbox.is(':checked'));
            }

            updateDisplay();

            // Inject the icon if applicable
            if ($widget.find('.state-icon').length == 0) {
              $widget.prepend('<span class="state-icon ' + settings[$widget.data('state')].icon + '"></span>');
            }
          }
          init();
        });

        $('#get-checked-data').on('click', function(event) {
          event.preventDefault();
          var checkedItems = {}, counter = 0;
          $("#check-list-box li.active").each(function(idx, li) {
            checkedItems[counter] = $(li).text();
            counter++;
          });
          $('#display-json').html(JSON.stringify(checkedItems, null, '\t'));
        });
      }

    };
  });
  return LessonManager.HeaderApp.List.Controller;
});