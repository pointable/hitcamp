'use strict';

exports = module.exports = function(app, mongoose) {

  var lessonDataSchema = new mongoose.Schema({
    lesson: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'},
    idClassroom: {type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'},
    lessonDataElement: [mongoose.modelSchemas.lessonDataElementSchema],
    timeCreated: {type: Date, default: Date.now},
    timeLastModified: {type: Date, default: Date.now}
  });

  lessonDataSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('LessonData', lessonDataSchema);

};
