define(["app",
  "text!apps/plugins/list/templates/plugins_item.html",
  "text!apps/plugins/list/templates/plugins_template.html",
  "text!apps/plugins/list/templates/pluginsTypes_template.html",
  "bootstrap"],
    function(TeacherSession, pluginsItemTpl, pluginsTpl, pluginsTypesTpl) {
      TeacherSession.module("PluginApps.List.View", function(View, TeacherSession, Backbone, Marionette, $, _) {
        View.Plugin = Marionette.ItemView.extend({
          className: "plugin-wrapper",
          template: _.template(pluginsItemTpl),
          events: {
            'click .js-show': 'showPluginClicked'
          },
          showPluginClicked: function(event) {
            event.preventDefault();
            console.log("showPluginClicked");
            //this.trigger("plugin:show:full", this,this.model);
            this.trigger("plugin:show", this, this.model);
          },
          remove: function() {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          initialize: function() {
            // this.model.on('change', this.render);
          }
        });

        View.Plugins = Marionette.CompositeView.extend({
          className: "row",
          template: _.template(pluginsTpl),
          childView: View.Plugin,
          childViewEventPrefix: "plugins",
          childViewContainer: ".plugins-js",
          initialize: function() {
            this.collection = this.model.get('plugins');
            console.log("%O", this.collection);
          },
          events: {
          }
        });

        View.PluginsTypes = Marionette.CollectionView.extend({
          className: "container-fluid plugin-types-area activity-red-yellow",          
          childView: View.Plugins,          
          initialize: function() {
            console.log("%O", this.collection);
//            var self = this;
//            $(".js-nav-campfire").off();
//            $(".js-nav-campfire").on("click", function(e) {
//              e.preventDefault();
//              self.trigger("plugins:list:show", self, self.model);
//            });

//                this.attachHtml = function(collectionView, childView, index) {
//                  collectionView.$el.find("#addOne").before(childView.el);                  
//                };
//                this.listenTo(this.collection, "add", function(collectionView, childView, index) {                  
//                  this.attachHtml = function(collectionView, childView, index) {
//                    collectionView.$el.find("#addOne").before(childView.el);
//                  };
//                });
          },
          events: {
          }
        });
        
        View.PluginsTypesLayout = Marionette.LayoutView.extend({
          className:"plugins-area-wrapper",
          template: _.template(pluginsTypesTpl),
          regions:{
            pluginsView:"#plugins-view"
          },
          triggers:{                      
          "click .js-show-plugins": "plugins:list:show"            
          },
          onShow:function(){
            var pluginName = document.plugin.pluginName;
            if(typeof pluginName !== 'undefined'){
              var active=true;
              TeacherSession.trigger("plugin:show:update",pluginName,active);              
            }
          }
        });

      });
      return TeacherSession.PluginApps.List.View;
    });
