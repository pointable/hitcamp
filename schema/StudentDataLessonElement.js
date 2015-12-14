'use strict';

exports = module.exports = function(app, mongoose) {

  var studentDataLessonElementSchema = new mongoose.Schema({
    idActivity: {type: mongoose.Schema.Types.ObjectId, ref: 'Activity'},
    idElement: {type: String, default: ''},
    timeCreated: {type: Date, default: Date.now},
    elementData: {type: Object, default: {}}
  });

  app.db.model('StudentDataLessonElement', studentDataLessonElementSchema);

};
