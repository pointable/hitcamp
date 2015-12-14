'use strict';

exports = module.exports = function(app, mongoose) {

  var studentDataLessonSchema = new mongoose.Schema({
    lesson: {type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'},
    idStudent: {type: String},//, unique: true},
    classroom: {type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'},    
    timeCreated: {type: Date, default: Date.now},
    deletionDate: {type: Date, expires: '24h', default: Date.now},
    elementsData: [mongoose.modelSchemas.lessonDataElementStudentSchema],
  });

  studentDataLessonSchema.index({idStudent: 1, idClassroom: 1, lesson: 1}, {unique: true});
  app.db.model('StudentDataLesson', studentDataLessonSchema);

};
