/* global app:true */

(function() {
  'use strict';

  app = app || {};

  app.Record = Backbone.Model.extend({
    idAttribute: '_id',
    defaults: {
      _id: undefined,
      data: '',
      activityName: ''
    },
    url: function () { 
      return '/adventures/edit/' + app.mainView.results._id + '/activities/' + (this.isNew() ? '' : this.id +'/');
    }
//    url: function() {
//      return '/adventures/edit/'+ this.id+ '/edit'+ (this.isNew() ? '' : this.id +'/');
//    }
  });

  app.RecordCollection = Backbone.Collection.extend({
    model: app.Record,
    url: function () { 
      return '/adventures/edit/' + app.mainView.results._id + '/activities/';
    },
    parse: function(results) {
      //process results from server before return to model constructor
      return results.activities;
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template( $('#tmpl-header').html() ),
    events: {
      'submit form': 'preventSubmit',
      'keypress input[type="text"]': 'addNewOnEnter',
      'click .btn-add': 'addNew'
    },
    initialize: function() {
      this.model = new app.Record();
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template( this.model.attributes ));
    },
    preventSubmit: function(event) {
      event.preventDefault();
    },
    addNewOnEnter: function(event) {
      if (event.keyCode !== 13) { return; }
      event.preventDefault();
      this.addNew();
    },
    addNew: function() {
      if (this.$el.find('[name="activityName"]').val() === '') {
        alert('Please enter a activity name.');
      }
      else {
        this.model.save({
          activityName: this.$el.find('[name="activityName"]').val()
        },{
          success: function(model, response) {
            if (response.success) {
              model.id = response.record._id;
              location.href = model.url();
            }
            else {
              alert(response.errors.join('\n'));
            }
          }
        });
      }
    }
  });

  app.ResultsView = Backbone.View.extend({
    el: '#results-table',
    template: _.template( $('#tmpl-results-table').html() ),
    initialize: function() {

      this.collection = new app.RecordCollection( app.mainView.results.activities);
//      console.log(this.collection);
      this.listenTo(this.collection, 'reset', this.render);     
      this.render();
    },
    render: function() {
      this.$el.html( this.template() );

      var frag = document.createDocumentFragment();
//      console.log(this.collection);
      this.collection.each(function(record) {
//        console.log('test ' + record);
        var view = new app.ResultsRowView({ model: record });
        //get reference to new record DOM and append to frag.
        frag.appendChild(view.render().el);
      }, this);
      $('#results-rows').append(frag);

      if (this.collection.length === 0) {
        $('#results-rows').append( $('#tmpl-results-empty-row').html() );
      }
    }
  });

  app.ResultsRowView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template( $('#tmpl-results-row').html() ),
    events: {
      'click .btn-details': 'viewDetails',
      'click .btn-danger': 'deleteActivity'
    },
    viewDetails: function() {
      location.href = this.model.url();
    },
    deleteActivity: function() {
//      alert('delete: ' + this.model.get('_id'));
      if (confirm('Delete: ' + this.model.get('activityName') + '\nAre you sure?')) {
        this.model.destroy({
//          url: this.model.url() +'role-admin/',
          success: function(){//model, response) {
            app.resultsView.collection.fetch({ data: '', reset: true });
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
      this.$el.html(this.template( this.model.attributes ));
      return this;
    }
  });



  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      this.results = JSON.parse( $('#data-results').html() );
//      this.results = this.results.activities;
//      this.results = _(this.results).flatten(true);
      console.log(this.results.activities);
//      app.mainView.model.id = this.results._id;
//      console.log(this.results);
      app.headerView = new app.HeaderView();
      app.resultsView = new app.ResultsView();
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
        app.resultsView.collection.fetch({ reset: true });
      }

      app.firstLoad = false;
    },
    query: function(params) {
      app.resultsView.collection.fetch({ data: params, reset: true });
      app.firstLoad = false;
    }
  });

  $(document).ready(function() {
    app.firstLoad = true;
    app.router = new app.Router();
    Backbone.history.start();
  });
}());
