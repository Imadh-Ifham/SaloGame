import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    required: true,
    enum: ['feedback', 'suggestion']
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: false,
    min: 1,
    max: 5
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'service', 'facility', 'games', 'events']
  },
  screenshot: {
    type: String,
    required: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: false
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'reviewed', 'resolved']
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);