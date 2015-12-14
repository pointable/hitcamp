/* global app:true */

google.load("visualization", "1", {packages: ["corechart", "table"]});
google.setOnLoadCallback(function() {
});

(function() {
  'use strict';

  app = app || {};

  app.Classroom = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/classrooms/' + this.model.get('path') + '/configure/';
    }
  });

  app.HeaderView = Backbone.View.extend({
    el: '#header',
    template: _.template($('#tmpl-header').html()),
    initialize: function() {
      this.model = app.mainHeaderView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));
    }
  });

  app.MainHeaderView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainHeaderView = this;
      var data = ($('#data-record').html());
      this.model = new app.Classroom(JSON.parse(data));

      app.headerView = new app.HeaderView();
//      app.statsView = new app.StatsView();
    }
  });

  $(document).ready(function() {
    app.mainHeaderView = new app.MainHeaderView();
  });
}());

(function() {
  'use strict';
  var chartDataTemplate = {
    labels: [],
    datasets: [
      {
        fillColor: "rgba(151,187,205,0.5)",
        strokeColor: "rgba(151,187,205,1)",
        data: []
      }
    ]
  };
  app = app || {};

  app.Stats = Backbone.Model.extend({
    idAttribute: '_id',
    url: function() {
      return '/classrooms/' + this.model.get('path') + '/configure/';
    }

  });
  app.StatsView = Backbone.View.extend({
    el: '#stats',
    template: _.template($('#tmpl-stats').html()),
    initialize: function() {
      this.model = app.mainView.model;
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    render: function() {
      this.$el.html(this.template(this.model.attributes));

      var ctx = $("#myChart").get(0).getContext("2d");
      var students = this.model.get('students');
      var chartData = app.processChartData(students);
      var steps = 10;

      var highestStudent = _.max(students, function(student) {
        return student.score;
      });
      var myNewChart = new Chart(ctx).Bar(chartData, {
        scaleOverride: true,
        scaleSteps: steps,
        scaleStepWidth: Math.ceil(highestStudent.score / steps),
        scaleStartValue: 0
      });

      app.drawTable(students);
    }
  });
  app.NoStudentsView = Backbone.View.extend({
    el: '#stats',
    template: _.template($('#tmpl-no-students').html()),
    initialize: function() {
      this.render();
    },
    render: function() {
      this.$el.html(this.template());
    }
  });
  
  app.processChartData = function(students) {
    var chartData = chartDataTemplate;
    chartData.labels = [];
    chartData.datasets[0].data = [];

    _.each(students, function(student, i) {
      chartData.labels.push(student.name);
      chartData.datasets[0].data.push(student.score);
    });
    console.log(chartData);
    return chartData;
  };


  app.MainView = Backbone.View.extend({
    el: '.page .container',
    initialize: function() {
      app.mainView = this;
      var data = ($('#data-stats').html());
      var parsedData = JSON.parse(data);
      var sortedStudents = this.sortData(parsedData.students);
      parsedData.students = sortedStudents;
      console.log(parsedData);
      if (parsedData.students.length > 0) {
        this.model = new app.Stats(parsedData);
        app.statsView = new app.StatsView();
      } else{        
        app.noStudentsView = new app.NoStudentsView();
      }
    },
    sortData: function(students) {
      var sortedStudents = _.sortBy(students, function(student) {
//        console.log(student);
        return student.score;
      })
      return sortedStudents;
    }
  });

  app.drawTable = function(students) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Student');
    data.addColumn('number', 'Score');

    var rows = [];
    _.each(students, function(student) {
      score = student.score;
      if (!score)
        score = 0;
      var score = parseInt(score);

      rows.push([student.name, score]);
    });
    console.log(rows);
    data.addRows(rows);
    var table = new google.visualization.Table(document.getElementById('table_div'));
    table.draw(data, {showRowNumber: true, width: 500});
  };

  $(document).ready(function() {
    app.mainView = new app.MainView();
  });
}());