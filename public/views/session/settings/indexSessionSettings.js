/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Classroom = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      isLocked: false
    },
    url: function() {
      return '/classrooms/' + this.model.get('path') + '/configure/';
    }
  });

  app.Delete = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      isLocked: false,
      errors: [],
      errfor: {}
    },
    url: function() {
      return '/classrooms/' + app.mainView.model.get('path') + '/configure/';
    }
  });

  app.Identity = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      success: false,
      errors: [],
      errfor: {},
      lesson: '',
      path: '',
      PIN: '',
      name: '',
      isLocked: false
    },
    url: function() {
      return '/classrooms/' + app.mainView.model.get('path') + '/configure/';
    },
    parse: function(response) {
      if (response.user) {
        app.mainView.model.set(response.user);
        delete response.user;
      }

      return response;
    }
  });


  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template($('#tmpl-header').html()),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
    }
  });

  app.IdentityView = Backbone.View.extend({
    el: '#identity',
    template: _.template($('#tmpl-identity').html()),
    events: {
      'click .btn-update': 'update'
    },
    initialize: function() {
      this.model = new app.Identity();
      this.syncUp();
      this.listenTo(app.mainView.model, 'change', this.syncUp);
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    syncUp: function() {
      this.model.set({
        _id: app.mainView.model.id,
//        isActive: app.mainView.model.get('isActive'),
        name: app.mainView.model.get('name'),
        path: app.mainView.model.get('path'),
        PIN: app.mainView.model.get('PIN'),
        lesson: app.mainView.model.get('lesson'),
        isLocked: app.mainView.model.get('isLocked')
      });
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));

      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
        }
      }
    },
    update: function() {
      var originalPath = this.model.get('path');
      this.model.save({
//        isActive: this.$el.find('[name="isActive"]').val(),
        name: this.$el.find('[name="name"]').val(),
        path: this.$el.find('[name="path"]').val(),
        PIN: this.$el.find('[name="PIN"]').val(),
        lesson: this.$el.find('[name="lesson"]').val()
      }, {
        success: function(model, response) {
//          console.log(response);
          if (response.success && originalPath !== model.get('path')) {
            setTimeout(function() {
              location.href = '/classrooms/' + model.get('path') + '/configure/';
            }, 500);
          }
        }
      });
    }
  });


  app.DeleteView = Backbone.View.extend({
    el: '#delete',
    template: _.template($('#tmpl-delete').html()),
    events: {
      'click .btn-delete': 'delete',
    },
    initialize: function() {
      this.model = new app.Delete({_id: app.mainView.model.id,
        isLocked: app.mainView.model.attributes.isLocked});
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      console.log(this.model.attributes);
      this.$el.html(this.template(this.model.attributes));
    },
    delete: function() {
      if (confirm('Are you sure?')) {
        this.model.destroy({
          success: function(model, response) {
            if (response.success) {
              location.href = '/classrooms/';
            }
            else {
              app.deleteView.model.set(response);
            }
          }
        });
      }
    }
  });

  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      var data = ($('#data-record').html());
      this.model = new app.Classroom(JSON.parse(data));
      console.log(this.model);
      app.headerView = new app.HeaderView();
      app.identityView = new app.IdentityView();
//      app.passwordView = new app.PasswordView();
//      app.rolesView = new app.RolesView();
      app.deleteView = new app.DeleteView();
    }
  });

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());
