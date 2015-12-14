/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Record = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: undefined,
      data: '',
      lessonName: '',
      isComplete: ''
    },
    url: function() {
      return '/adventures/edit' + (this.isNew() ? '' : '/' + this.id);
//      return '/adventures/edit/' + this.id + '/edit/';
    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: '/adventures/edit',
    parse: function(results) {
      app.pagingView.model.set({
        pages: results.pages,
        items: results.items
      });
      app.filterView.model.set(results.filters);
      return results.data;
    }
  });

  app.Filter = Backbone.Model.extend({
    defaults: {
      lessonName: '',
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
        alert('Please enter an Adventure title');
      }
      else {
        this.model.save({
          lessonName: this.$el.find('[name="lessonName"]').val()
        }, {
          success: function(model, response) {
            if (response.success) {
              model.id = response.record._id;
//              location.href = model.url();
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
    intro: function(event) {      
      event.preventDefault();
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
      this.collection.each(function(record) {
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
//      'click .btn-success': 'runLesson',
      'click .edit': 'openEditor',
      'click .clone': 'cloneLesson',
      'click .delete': 'deleteLesson'
    },
    openEditor: function() {
      location.href = this.model.url();
//      + 'activities/';
    },
    cloneLesson: function() {
//      var idLesson = this.model.get('_id');

//      console.log(idLesson);
      $.ajax({
        url: '/adventures/edit/' + this.model.get('_id') + '/clone',
        type: 'POST',
        data: "",
        success: function(response) {
          app.resultsView.collection.fetch({data: '', reset: true});
//            parent.location.href = parent.location.href;//'/classrooms/'+ parent.idPath + '';
        }
      });
    },
    runLesson: function() {
//      alert('run: ' + this.model.get('_id'));
//      location.href = '../session/create/' + this.model.get('_id') + '/';
//      this.model.url();
    },
    deleteLesson: function() {
//      alert('delete: ' + this.model.get('_id'));
      if (confirm('Delete: ' + this.model.get('lessonName') + '\nAre you sure?')) {
        this.model.destroy({
          success: function() {//model, response) {
            app.resultsView.collection.fetch({data: '', reset: true});
          }
        });
      }
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
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
//      console.log(this.results);
      app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
      app.filterView = new app.FilterView();
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
    $("#createAdventure").focus();
  });
}());
