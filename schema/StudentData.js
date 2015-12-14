'use strict';

exports = module.exports = function(app, mongoose) {

  var studentDataSchema = new mongoose.Schema({
    idStudent: {type: String},//, unique: true},
    idClassroom: {type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'},
    name: {type: String},
//    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    lessonsData: [{type: mongoose.Schema.Types.ObjectId, ref: 'StudentDataLesson'}],
    timeCreated: {type: Date, default: Date.now},
    deletionDate: {type: Date, expires: '48h', default: Date.now}
  });

  studentDataSchema.index({idStudent: 1, idClassroom: 1}, {unique: true});
  studentDataSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('StudentData', studentDataSchema);

};
