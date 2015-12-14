define(["app",
  "text!apps/plugins/show/templates/pluginsShow_template.html",
  "text!apps/plugins/show/templates/pluginsShowMiniApp_template.html"
],
    function(StudentManager, elementShowTpl,elementShowActivityTpl) {
      StudentManager.module("PluginsApps.Show.View",
          function(View, StudentManager, Backbone, Marionette, $, _) {
            View.Element = Marionette.ItemView.extend({
              getTemplate: function() {
                if (this.model.get("mode") === "internal") {
                  console.log("get Template external");
                  return this.template=_.template(elementShowActivityTpl);
                } else {
                  console.log("get Template internal");
                  return this.template=_.template(elementShowTpl);
                }
              },
//              template: _.template(elementShowTpl),
              className: "container-fluid padding-0px plugin-area",
              events: {
                'click .js-url': 'launchPlugin',
                'click .js-close': 'exitPlugin',
              },
              exitPlugin: function(event) {
                event.preventDefault();
                this.trigger("plugin:exit",this);
              },
              launchPlugin: function() {
                var url = 'about:blank';
                var options = '';
                this.trigger("plugin:show", url, options);
              }
            });
          });
      return StudentManager.PluginsApps.Show.View;
    });


