const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessagesSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'conversations',
    },
    from: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Messages = mongoose.model('messages', MessagesSchema);
