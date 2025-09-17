import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message content cannot exceed 2000 characters']
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: [true, 'Channel is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'announcement'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
messageSchema.index({ channel: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ replyTo: 1 });

// Update channel's lastMessageAt when a new message is created
messageSchema.post('save', async function() {
  try {
    await mongoose.model('Channel').findByIdAndUpdate(
      this.channel,
      { lastMessageAt: new Date() }
    );
  } catch (error) {
    console.error('Error updating channel lastMessageAt:', error);
  }
});

export default mongoose.model('Message', messageSchema);