const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OnlineUserSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  socketId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = OnlineUser = mongoose.model('onlineusers', OnlineUserSchema);
