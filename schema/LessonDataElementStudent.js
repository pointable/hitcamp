'use strict';

exports = module.exports = function(app, mongoose) {

  var lessonDataElementStudentSchema = new mongoose.Schema({
    idStudent: {type: String, unique: true},
    timeCreated: {type: Date, default: Date.now},
    elementData: {type: Object, default: {}}
  });

  app.db.model('LessonDataElementStudent', lessonDataElementStudentSchema);

};
