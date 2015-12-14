'use strict';

exports = module.exports = function(app, mongoose) {
  //embeddable docs first
  require('./schema/Note')(app, mongoose);
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  require('./schema/Category')(app, mongoose);
  
  require('./schema/Student')(app, mongoose);
  
  require('./schema/StudentDataLesson')(app, mongoose);
  require('./schema/StudentDataLessonElement')(app, mongoose);
  
  require('./schema/LessonDataElement')(app, mongoose);
  require('./schema/LessonDataElementStudent')(app, mongoose); 
  
  
  //then regular docs
  require('./schema/StudentData')(app, mongoose);
  require('./schema/LessonData')(app, mongoose);
  
  require('./schema/Lesson')(app, mongoose);
  require('./schema/Activity')(app, mongoose);
  require('./schema/WordList')(app, mongoose);
  require('./schema/Classroom')(app, mongoose);

  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);
  
};
