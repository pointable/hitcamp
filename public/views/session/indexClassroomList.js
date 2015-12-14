/* global app:true */

(function() {
  'use strict';
  app = app || {};
  app.Record = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: undefined,
      data: '',
      name: '',
      path: '',
      PIN: '',
      isComplete: '',
      isLocked: false
    },
    url: function() {
      return '/classrooms' + (this.isNew() ? '' : '/' + this.get('path')); //.id
    },
    fullPath: function() {
      return location.protocol + '//' + location.host + '/' + this.get('path');
    }
  });
  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: '/classrooms',
    parse: function(results) {
      app.pagingView.model.set({
        pages: results.pages,
        items: results.items
      });
//      app.filterView.model.set(results.filters);
      return results.data;
    }
  });
  app.Filter = Backbone.Model.extend({
    defaults: {
      name: '',
      isComplete: '',
      sort: '',
      limit: ''
    }
  });
  app.Paging = Backbone.Model.extend({
    defaults: {
      pages: {},
      items: {}
    }
  });
  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template($('#tmpl-header').html()),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'addNewOnEnter',
      'click .btn-add': 'addNew',
      'click .btn-intro': 'intro'
    },
    initialize: function() {
      this.model = new app.Record();
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      event.preventDefault();
      this.addNew();
    },
    addNew: function() {
      if (this.$el.find('[name="lessonName"]').val() === '') {
        alert('Please enter a classroom name.');
      }
      else {
        this.model.save({
          name: this.$el.find('[name="name"]').val()
        }, {
          success: function(model, response) {
            if (response.success) {
              model.id = response.record._id;
//              location.href = model.url();
//              Backbone.history.navigate('/', { trigger: true });
//              app.resultsView.collection.fetch({ data: '', reset: true });
//              location.href = location.href;

              app.resultsView.collection.fetch({data: '', reset: true});
              if (introJSRunning) {
                intro.exit();
                setTimeout(function() {
                  introStart(true);
                }, 500);
              }
            }
            else {
              alert(response.errors.join('\n'));
            }
          }
        });
      }
    },
    intro: function() {
      document.introStart();
    }
  });
  app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template($('#tmpl-results-table').html()),
    initialize: function() {
      this.collection = new app.RecordCollection(app.mainView.results.data);
      this.listenTo(this.collection, 'reset', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
      var frag = document.createDocumentFragment();
//      console.log(this.collection);
      var index = 0;
      this.collection.each(function(record) {
        record.attributes.index = index++;
        console.log(record);
        var view = new app.ResultsRowView({model: record});
        frag.appendChild(view.render().el);
      }, this);
      $('#results-rows').append(frag);
      if (this.collection.length === 0) {
        $('#results-rows').append($('#tmpl-results-empty-row').html());
      }
    }
  });
  app.ResultsRowView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#tmpl-results-row').html()),
    events: {
      'click .launch': 'runClassroom',
      'click .viewReports': 'viewReports',
      'click .manageStudents': 'manageStudents',
      'click .configureClassroom': 'configureClassroom',
      'click .deleteClassroom': 'deleteClassroom',
      'click .lessonEdit': 'lessonEdit',
      'click .dropdown-menu li a': 'selectLesson'
    },
    lessonEdit: function(event) {
      event.preventDefault();
      event.stopPropagation();
//      console.log($(event.target).parents("li"));
      location.href = '/adventures/edit/' + $(event.target).parents("li")[0].id;
    },
    selectLesson: function(event) {
      event.preventDefault();
      var parentLi = $(event.target).parents('li');
//      console.log(element);
      var selText = parentLi.find('.lesson-name').text(); //$(event.target).text();

//      console.log(selText);
      $(event.target).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret pull-right"></span>');
      if ($(event.target).parent().hasClass('lessonNew')) {
        location.href = '/adventures/edit/'
      } else {
//        console.log($(event.target).parent());
        var idLesson = parentLi[0].id;
        console.log(idLesson);
        $.ajax({
          url: '/classrooms/' + this.model.get('_id') + '/',
          type: 'PUT',
          data: "idLesson=" + idLesson,
          success: function(response) {
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
          }
        });
      }

      $(event.target).parents('.btn-group').find('li').removeClass("active");
      parentLi.addClass("active");
    },
    viewReports: function(event) {
      event.preventDefault();
      location.href = this.model.url() + '/reports/';
    },
    manageStudents: function(event) {
      event.preventDefault();
      location.href = this.model.url() + '/students/';
    },
    configureClassroom: function() {
      event.preventDefault(event);
      location.href = this.model.url() + '/configure/';
    },
    runClassroom: function(event) {
      event.preventDefault();
//      alert('run: ' + this.model.get('_id'));
      //location.href = '/' + this.model.get('path');
      window.open('/' + this.model.get('path'), '_blank');
//      this.model.url();
    },
    deleteClassroom: function(event) {
      event.preventDefault();
//      alert('delete: ' + this.model.get('_id'));
      if (confirm('Delete: ' + this.model.get('name') + '\nAre you sure?')) {
        this.model.destroy({
//          url: this.model.url() +'role-admin/',
          success: function() {//model, response) {
            app.resultsView.collection.fetch({data: '', reset: true});
          }
//            console.log(JSON.stringify(this.model.toJSON()));
//            if (response.lesson) {
//              app.mainView.model.set(response.lesson);
//              delete response.lesson;
//            }

//            app.rolesView.model.set(response);
//          }
        });
      }
//      location.href = this.model.url();
    },
    render: function() {
      var values = this.model.attributes;
      values.fullPath = this.model.fullPath();
      values.lessons = app.mainView.lessons;
      if (!values.lesson) {
        values.lesson = null;
      }
      var lessonUsed = _.findWhere(values.lessons, {_id: this.model.get('lesson')});
      if (!lessonUsed) {
        values.lessonName = "No Adventure";
      } else {
        values.lessonName = lessonUsed.lessonName;
      }

      console.log(values);
      this.$el.html(this.template(values));
      return this;
    }
  });
  app.FilterView = Backbone.View.extend({
    el: '#filters',
    template: _.template($('#tmpl-filters').html()),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'filterOnEnter',
      'change select': 'filter'
    },
    initialize: function() {
      this.model = new app.Filter(app.mainView.results.filters);
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
      for (var key in this.model.attributes) {
        if (this.model.attributes.hasOwnProperty(key)) {
          this.$el.find('[name="' + key + '"]').val(this.model.attributes[key]);
        }
      }
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    filterOnEnter: function(event) {
      if (event.keyCode !== 13) {
        return;
      }
      this.filter();
    },
    filter: function() {
      var query = $('#filters form').serialize();
      Backbone.history.navigate('q/' + query, {trigger: true});
    }
  });
  app.PagingView = Backbone.View.extend({
    el: '#results-paging',
    template: _.template($('#tmpl-results-paging').html()),
    events: {
      'click .btn-page': 'goToPage'
    },
    initialize: function() {
      this.model = new app.Paging({pages: app.mainView.results.pages, items: app.mainView.results.items});
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      if (this.model.get('pages').total > 1) {
        this.$el.html(this.template(this.model.attributes));
        if (!this.model.get('pages').hasPrev) {
          this.$el.find('.btn-prev').attr('disabled', 'disabled');
        }

        if (!this.model.get('pages').hasNext) {
          this.$el.find('.btn-next').attr('disabled', 'disabled');
        }
      }
      else {
        this.$el.empty();
      }
    },
    goToPage: function(event) {
      var query = $('#filters form').serialize() + '&page=' + $(event.target).data('page');
      Backbone.history.navigate('q/' + query, {trigger: true});
      $('body').scrollTop(0);
    }
  });
  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.results = JSON.parse($('#data-results').html());
      this.lessons = JSON.parse($('#data-lessons').html());
      this.lessons = this.lessons.reverse();
      console.log(this.results);
      app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
      //app.filterView = new app.FilterView();
      app.pagingView = new app.PagingView();
    }
  });
  app.Router = Backbone.Router.extend({
    routes: {
      '': 'default',
      'q/:params': 'query'
    },
    initialize: function() {
      app.mainView = new app.MainView();
    },
    default: function() {
      if (!app.firstLoad) {
        app.resultsView.collection.fetch({reset: true});
      }

      app.firstLoad = false;
    },
    query: function(params) {
      app.resultsView.collection.fetch({data: params, reset: true});
      app.firstLoad = false;
    }
  });
  $(document).ready(function() {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
    $("#create").focus();
    if ($('#data-hideGuide').html() !== "true")
    {
      $(".adventure-guide").css("display", "block");
    }

    $(".js-guide-close").click(function() {
      event.preventDefault();
      var div = document.getElementById("adventure-demo-video");
      var iframe = div.getElementsByTagName("iframe")[0].contentWindow;
      iframe.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
      var hideGuide = $("#checkboxHide").is(":checked");
      $.ajax({
        url: '/account/settings/guide',
        type: 'PUT',
        data: "hideGuide=" + hideGuide,
        success: function(response) {
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
        }
      });
      $(".adventure-guide").hide();
      //update user state
    });
    $(".btn-start-guide").click(function() {
    event.preventDefault();
      $(".js-guide-close")[0].click();
      
    });

  });
}());
