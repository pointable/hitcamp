'use strict';

exports = module.exports = function(app, mongoose) {

  var lessonDataElementSchema = new mongoose.Schema({
    idActivity: {type: mongoose.Schema.Types.ObjectId, ref: 'Activity'},
    idElement: {type: String, default: ''},
    studentsData: [mongoose.modelSchemas.lessonDataElementStudentSchema],
    elementData: { type: Object, default: {} },
    timeCreated: {type: Date, default: Date.now}
  });
  
  lessonDataElementSchema.index({idActivity: 1, idElement: 1}, {unique: true});
  //lessonDataElementSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('LessonDataElement', lessonDataElementSchema);

};
