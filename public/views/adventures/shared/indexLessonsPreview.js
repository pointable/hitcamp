/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Signup = Backbone.Model.extend({
    url: '/' + getPath() + '/signup',
    defaults: {
      errors: [],
      errfor: {},
      username: '',
      pin: '',
      password: ''
    }
  });

  app.SignupView = Backbone.View.extend({
    el: '#signup',
    template: _.template($('#tmpl-signup').html()),
    events: {
      'submit form': 'preventSubmit',
      'keypress [name="password"]': 'signupOnEnter',
      'click .btn-signup': 'signup'
    },
    initialize: function() {
      this.model = new app.Signup();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
//      this.$el.find('[name="username"]').focus();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    signupOnEnter: function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      if ($(event.target).attr('name') !== 'password') {
        return;
      }
      event.preventDefault();
      this.signup();
    },
    signup: function() {
      this.$el.find('.btn-signup').attr('disabled', true);
      this.model.url = getPath() + '/signup';
      this.model.save({
        username: this.$el.find('[name="username"]').val(),
        pin: this.$el.find('[name="pin"]').val(),
        password: this.$el.find('[name="password"]').val()
      }, {
        success: function(model, response) {
          if (response.success) {
            location.href = '/' + getPath();
          }
          else {
            model.set(response);
          }
        }
      });
    }
  });

  $(document).ready(function() {
  });
}());

/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Login = Backbone.Model.extend({
    url: '/' + getPath + '/login',
    teacherLoginURL: '/' + getPath + '/teacher',
    defaults: {
      errors: [],
      errfor: {},
      username: '',
      password: ''
    }
  });

  app.LoginView = Backbone.View.extend({
    el: '#login',
    template: _.template($('#tmpl-login').html()),
    events: {
      'submit form': 'preventSubmit',
      'keypress [name="password"]': 'loginOnEnter',
    },
    initialize: function() {
      this.model = new app.Login();
      this.listenTo(this.model, 'sync', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      this.$el.find('[name="username"]').focus();
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    loginOnEnter: function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      if ($(event.target).attr('name') !== 'password') {
        return;
      }
      event.preventDefault();
      this.login();
    },
    loginGuest: function() {
      location.href = '/' + getPath() + '/guest';
    },
    login: function() {
      this.$el.find('.btn-login').attr('disabled', true);

      this.model.url = '/' + getPath() + '/login';
      this.model.save({
        username: this.$el.find('[name="username"]').val(),
        password: this.$el.find('[name="password"]').val()
      }, {
        success: function(model, response) {
          if (response.success) {
            location.href = '/' + getPath();
          }
          else {
            model.set(response);
          }
        }
      });
    }
  });

  $(document).ready(function() {
    window.idLesson = $('#idLesson').html();

    if ($("#is-teacher").html() === "true") {
      $("#btn-import").click(function(event) {
        event.preventDefault();
        $.ajax({
          url: '/adventures/edit/' + window.idLesson + '/clone',
          type: 'POST',
          data: "import=true",
          success: function(response) {
            if (response.success){
              location.href =  '/adventures/edit/' + response.idLesson + '/';
            }else {
              alert("Error! Import unsuccessful");
            }
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
          }
        });
      });
    } else {
      app.loginView = new app.LoginView();
      app.signupView = new app.SignupView();
    }

//    console.log(window.classroomPath);


  });
}());

function getPath() {
//  console.log(window.classroomPath);
  return window.classroomPath;
}