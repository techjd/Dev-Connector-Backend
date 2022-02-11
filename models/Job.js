const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  lookingFor: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  requiredSkills: {
    type: String,
    required: true,
  },
  budget: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Job = mongoose.model('jobs', JobSchema);
