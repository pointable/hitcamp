define(["app",
  "text!apps/plugins/configureWord/templates/plugins_item.html",
  "text!apps/plugins/configureWord/templates/plugins_template.html",
  "text!apps/plugins/configureWord/templates/pluginsConfigureWord_template.html",
  "text!apps/plugins/configureWord/templates/pluginsConfigureWordLayout_template.html",  
  "bootstrap"],
    function(LessonManager, pluginsItemTpl, pluginsTpl, configureWordTpl,
        pluginsConfigureWordLayoutTpl) {
      LessonManager.module("PluginApps.ConfigureWord.View", function(View, LessonManager, Backbone, Marionette, $, _) {

        View.Plugin = Marionette.ItemView.extend({
          className: "plugin-wrapper",
          template: _.template(pluginsItemTpl),
          events: {
            'click .js-plugin-select': 'selectPluginApp'
          },          
          modelEvents: {
            'change:selected': "selectedChanged"
          },          
          style: {
            selected: function(view) {
              var selected = view.model.get("selected");
              if (selected) {
                $(view.el).find(".js-plugin-select").removeClass("word-list-normal").addClass("word-list-selected");
              } else {
                $(view.el).find(".js-plugin-select").removeClass("word-list-selected").addClass("word-list-normal");
              }
            },
            deactivated: function(view) {
              var activated = view.model.get("activated");
              if (activated) {
                $(view.el).find(".js-plugin-select").removeClass("word-list-deactivated").addClass("word-list-normal");
                $(view.el).find(".btn-app").removeClass("btn-word-list-deactivated").addClass("btn-word-list");
              } else {
                $(view.el).find(".js-plugin-select").removeClass("word-list-normal").addClass("word-list-deactivated");
                $(view.el).find(".btn-app").removeClass("btn-word-list").addClass("btn-word-list-deactivated");
              }
            }
          },
          selectedChanged: function() {
            this.style.selected(this);
          },
          selectPluginApp:function(e){
            e.preventDefault();
            if(!$(e.currentTarget).hasClass("word-list-deactivated"))
            {
              this.trigger("plugin:selected",this);           
            }            
          },
          remove: function() {
            var self = this;
            Marionette.ItemView.prototype.remove.call(this);
          },
          initialize: function() {
            //this.model.on('change', this.render);

          },
          onRender: function() {
            this.style.selected(this);
            this.style.deactivated(this);
          }
        });

        View.Plugins = Marionette.CompositeView.extend({
          className: "",
          template: _.template(pluginsTpl),
          childView: View.Plugin,
          childViewEventPrefix: "plugins",
          childViewContainer: "#plugins-apps",
          initialize: function() {
            this.collection = this.model.get('plugins');
//            console.log("%O", this.collection);
          },
          events: {
          }
        });

        View.ConfigureWordLayout = Marionette.LayoutView.extend({
          className: "modal custom fade ",
          id: "myModal",
          regions: {
            wordsList: "#wordsList",
            apps: "#apps"
          },
          attributes: {
            "tabindex": "-1",
            "role": "dialog",
            "aria-labelledby": "myModalLabel",
            "aria-hidden": "true"
          },
          template: _.template(pluginsConfigureWordLayoutTpl),
          initialize: function() {
//            this.model.on('change', this.render);
          },
          triggers: {
            'click  .js-save': "configure:save",
            'click .js-cancel': "configure:cancel",
            'click .js-new-list': "new:wordList",
            'click .js-guide': "configureWord:guide"
          },
          onRender: function() {
//            console.log("####Camp is rendered");            
          },
          onShow: function() {
          }
        });

        View.ConfigureWord = Marionette.ItemView.extend({
          template: _.template(configureWordTpl),
          initialize: function() {

          },
          events: {
            'change .js-select-wordList': 'selectedWordList',
            'click .js-close': 'closeDialog'
          },
          selectedWordList: function(event) {
            event.preventDefault();
            var target = event.target;
            var selectedIndex = target.selectedIndex;
//            console.log("id: "+target.id);
            this.trigger("plugins:configureWord:wordlist", this, event);
          },
          closeDialog:function(){            
            //This is handled using bootstrap callback
            //LessonManager.dialogRegion.closeDialog();              
            
          }
        });
      });
      return LessonManager.PluginApps.ConfigureWord.View;
    });
