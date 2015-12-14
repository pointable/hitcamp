define(["app",
  "text!apps/elements/list/templates/elements_dialog.html",
  "text!apps/elements/list/templates/elements_panel.html",
  "text!apps/elements/list/templates/elements_panel_item.html",
  "text!apps/elements/list/templates/elements_item.html",
  'jquery-ui'
],
    function(LessonManager, elementsDialogTpl, elementsPanelTpl, elementsPanelItemTpl, elementsItemTpl) {
      LessonManager.module("ElementsApp.List.View",
          function(View, LessonManager, Backbone, Marionette, $, _) {

            View.Element = Marionette.ItemView.extend({
              template: _.template(elementsItemTpl),
              className: function() {
                return 'element ' + this.model.get("color");
              },
              triggers: {
                'click .js-delete': "element:delete",
//            'click .js-show':"element:show"            
              }, events: {
                'click .js-show': "elementShowClicked"
              }, elementShowClicked: function(event) {
                event.preventDefault();
                this.trigger("element:show", this.model);
              }
            });

            View.Elements = Marionette.CompositeView.extend({
              template: _.template(elementsDialogTpl),
              childView: View.Element,
              childViewContainer: ".elements-wrapper",
              //className: "modal custom fade",
              id: "myModal",
//              attributes: {
//                "tabindex": "-1",
//                "role": "dialog",
//                "aria-labelledby": "myModalLabel",
//                "aria-hidden": "true"
//              },
              events: {
                'click .js-activity-title-text': "activityTitleTextClicked",
                'click .js-save': "activityTitleTextSaveClicked",
                'click .js-cancel': "activityTitleTextCancelClicked"
//                'click .js-new-images':'newImagesClicked'
              },
              triggers: {
                'click .js-close': "element:list:close",
                'click .js-new': "element:new",
                'click .js-new-images': "element:new:images"
              }, activityTitleTextClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:edit", event.target, this.model);
              }, activityTitleTextSaveClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:save", event.target, this.model);
              }, activityTitleTextCancelClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:cancel", event.target, this.model);
              },
              initialize: function() {

                this.appendHtml = function(collectionView, childView, index) {
                  collectionView.$el.find("#addOne").before(childView.el);
                };

              }
            });

            var sortableElements = ".elements-panel-wrapper";
            var curElement;
            View.ElementPanel = Marionette.ItemView.extend({
              template: _.template(elementsPanelItemTpl),
//              className: 'element-panel ',
              className: 'slide',
              triggers: {
                'click .js-delete': "element:delete",
//                'click .js-show':"element:show"            
              },
              events: {
//                'click .js-show': "elementShowClicked",
                'mousedown .js-show': 'mouseDownDetected',
                'touchstart .js-show': 'touchStartDetected'
              },
              modelEvents: {
                'change:selected': "selectedChange",
                'change:index':"indexChanged"
              },
              selectedChange: function(args, val) {
                this.style.highlight(this);                
              },
              indexChanged: function(args, val) {
                console.log("render index change");
//                this.render();
              },
              style: {
                highlight: function(view) {
                  var selected = view.model.get("selected");
                  if (typeof selected !== undefined && selected === true) {
                    $(view.el).find(".element-panel-preview").addClass("green-highlight");
                  } else {
                    $(view.el).find(".element-panel-preview").removeClass("green-highlight");
                  }
                }
              },
              initialize: function() {
               // View.listenTo(this.model, 'change',this.render);
                //this.model.on("change", this.render);
                this.style.highlight(this);
              },
              onRender: function() {
                console.log("###element render");
                this.style.highlight(this);
              },
              mouseDownDetected: function(e) {
                var that = this;
                curElement = this;
                e.preventDefault();
                var end, start;
                var target = e.target;
                start = new Date();
                var callDrag = setTimeout(function() {
                  //register a callback for setting the model 
                  $(sortableElements).sortable("enable");
                  console.log("sort Elements");
                }, 150);
                $(e.target).mouseup(function() {
                  clearTimeout(callDrag);
                  end = new Date();
                  if ((end.getTime() - start.getTime()) < 150) {
                    console.log("show element");
                    //LessonManager.trigger("element:show", that.elementPanel, that.activity, that.model);
                    that.trigger("element:show", that.model);
                  } else {
                    //set the new position , called when sort is done                                      
                  }
                  //if time less than 100ms
                  //is a click
                });
              },
              touchStartDetected: function(e) {
                var that = this;
                e.preventDefault();
                var end, start;
                var target = e.target;
                start = new Date();
                var callDrag = setTimeout(function() {
                  //register a callback for setting the model    
                  $(sortableElements).sortable("enable");
                }, 100);
                $(e.target).on({'touchend': function() {
                    clearTimeout(callDrag);
                    console.log("click");
                    end = new Date();
                    if ((end.getTime() - start.getTime()) < 100) {
                      console.log("show element");
                      that.trigger("element:show", that.model);
                    } else {
                      //set the activity new position
                      console.log("set new position");
//                      that.trigger("activity:setCoordinates", that.view, that.model);
                    }
                    //if time less than 100ms
                    //is a click
                  }
                });
              }
            });

            View.ElementsPanel = Marionette.CompositeView.extend({
              template: _.template(elementsPanelTpl),
              childView: View.ElementPanel,
//              childViewOptions: function(model) {
//                return{
//                  indexInCollections: this.collection.indexOf(model)
//                };
//              },
              className: "elements-wrapper",
              childViewContainer: ".elements-panel-wrapper",
              events: {
                'click .js-activity-title-text': "activityTitleTextClicked",
                'click .js-save': "activityTitleTextSaveClicked",
                'click .js-cancel': "activityTitleTextCancelClicked"
//                'click .js-new-images':'newImagesClicked'
              },
              triggers: {
                'click .js-close': "element:list:close",
                'click .js-new': "element:new",
                'click .js-new-images': "element:new:images"
              }, activityTitleTextClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:edit", event.target, this.model);
              }, activityTitleTextSaveClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:save", event.target, this.model);
              }, activityTitleTextCancelClicked: function(event) {
                event.preventDefault();
                this.trigger("activity:title:cancel", event.target, this.model);
              },
              initialize: function() {
//                var this_view = this;
//                this.appendHtml = function(collectionView, childView, index) {
//                  collectionView.$el.find("#addOne").before(childView.el);
//                };  

//                this.model.on("change",this.render);
//               this.listenTo(this.collection, 'change',this.render);
//                this.listenTo(this.model, 'change', this.render);
              },
              onRender: function() {
                var that=this;
                console.log("###element list render");
                var this_view = $(this.el);
                var sortableElements = ".elements-panel-wrapper";
                this_view.find(".elements-panel-wrapper").sortable({
                  axis: "y",
                  revert: true,
                  scroll: false,
                  placeholder: "sortable-placeholder",
                  cursor: "move",
                  start: function(e, ui) {
                    ui.helper.addClass("exclude-me");
//                    this_view.find(".elements-panel-wrapper .slide:not(.exclude-me)").css("visibility", "hidden");
//                    ui.helper.data("clone").hide();
//                    this_view.find(".cloned-slides .slide").css("visibility", "visible");
                  },
                  stop: function(e, ui) {
//                    console.log("e %O", e);                  
                    that.trigger("element:setIndex", ui, curElement);
                    this_view.find(".elements-panel-wrapper .slide.exclude-me").each(function() {
                      var item = $(this);
//                      var clone = item.data("clone");
//                      var position = item.position();
//
//                      clone.css("left", position.left);
//                      clone.css("top", position.top);
//                      clone.show();

                      item.removeClass("exclude-me");
//                      this_view.trigger("")
                    });

//                    this_view.find(".elements-panel-wrapper .slide").each(function() {
//                      var item = $(this);
//                      var clone = item.data("clone");
//                      //Fix bug for the clone not diplaying index correctly
//                      clone.attr("data-pos", item.index() + 1);
//
//                    });
//
//                    this_view.find(".elements-panel-wrapper .slide").css("visibility", "visible");
//                    this_view.find(".cloned-slides .slide").css("visibility", "hidden");
                  },
                  change: function(e, ui) {
//                    this_view.find(".elements-panel-wrapper .slide:not(.exclude-me)").each(function() {
//                      var item = $(this);
//                      var clone = item.data("clone");
//                      clone.stop(true, false);
//                      var position = item.position();
//                      clone.animate({
//                        left: position.left,
//                        top: position.top
//                      }, 200);
//                    });
                  }

                });

                $(sortableElements).sortable("disable");
              }
            });

            function dragMode() {
//                var this_view = $(this.el);
              //Creating the cloned slides after view is being appended


              $(".elements-panel-wrapper").sortable({
                axis: "y",
                revert: true,
                scroll: false,
                placeholder: "sortable-placeholder",
                cursor: "move",
                start: function(e, ui) {
                  ui.helper.addClass("exclude-me");
                  $(".elements-panel-wrapper .slide:not(.exclude-me)").css("visibility", "hidden");
                  ui.helper.data("clone").hide();
                  $(".cloned-slides .slide").css("visibility", "visible");
                },
                stop: function(e, ui) {
                  console.log("e %O", e);
                  console.log("UI %O", ui);
                  $(".elements-panel-wrapper .slide.exclude-me").each(function() {
                    var item = $(this);
                    var clone = item.data("clone");
                    var position = item.position();

                    clone.css("left", position.left);
                    clone.css("top", position.top);
                    clone.show();

                    item.removeClass("exclude-me");
//                      this_view.trigger("")
                  });

                  $(".elements-panel-wrapper .slide").each(function() {
                    var item = $(this);
                    var clone = item.data("clone");
                    //Fix bug for the clone not diplaying index correctly
                    clone.attr("data-pos", item.index() + 1);

                  });

                  $(".elements-panel-wrapper .slide").css("visibility", "visible");
                  $(".cloned-slides .slide").css("visibility", "hidden");
                },
                change: function(e, ui) {
                  $(".elements-panel-wrapper .slide:not(.exclude-me)").each(function() {
                    var item = $(this);
                    var clone = item.data("clone");
                    clone.stop(true, false);
                    var position = item.position();
                    clone.animate({
                      left: position.left,
                      top: position.top
                    }, 200);
                  });
                }

              });
            }


          });
      return LessonManager.ElementsApp.List.View;
    });
