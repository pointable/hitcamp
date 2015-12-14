define(["app",
  "text!apps/plugins/show/templates/pluginsShow_template.html",
  "text!apps/plugins/show/templates/pluginsShowFull_template.html"
],
    function(TeacherSession, elementShowTpl,elementShowFullTpl) {
      TeacherSession.module("PluginApps.Show.View",
          function(View, TeacherSession, Backbone, Marionette, $, _) {
            View.Element = Marionette.ItemView.extend({
              template: _.template(elementShowTpl),
              className: "container-fluid padding-0px plugin-types-area",
              events: {
                'click .js-url': 'launchPlugin',
                'click .js-close': 'exitPlugin',
                'click .js-expand': 'expandPlugin'
              },
              exitPlugin: function(event) {
                event.preventDefault();
                this.trigger("plugin:exit", this);
              },
              launchPlugin: function() {
                var url = '//www.youtube.com/embed/hLQl3WQQoQ0';
                var options = '';
                this.trigger("plugin:show", url, options);
              },
              expandPlugin: function(event) {
                event.preventDefault();
                this.trigger("plugin:expand");
              },                  
              onShow:function(){
                //check whether is opening app view, if it is then open the 
                if($("#frameMiniApp").length > 0 ){
                  TeacherSession.trigger("plugins:list:show:toggle");
                }
              }
            });

            View.ElementFull = Marionette.ItemView.extend({
              template: _.template(elementShowFullTpl),
              className: "container-fluid padding-0px plugin-area",
              events: {
                'click .js-url': 'launchPlugin',
                'click .js-close': 'exitPlugin',
                'click .js-expand': 'expandPlugin'
              },
              exitPlugin: function(event) {
                event.preventDefault();
                this.trigger("plugin:exit");
              },
              expandPlugin: function(event) {
                event.preventDefault();
                this.trigger("plugin:expand");
              },              
              launchPlugin: function() {
                var url = '//www.youtube.com/embed/hLQl3WQQoQ0';
                var options = '';
                this.trigger("plugin:show", url, options);
              }
            });
          });
      return TeacherSession.PluginApps.Show.View;
    });


