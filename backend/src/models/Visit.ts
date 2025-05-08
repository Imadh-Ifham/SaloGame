import mongoose, { Schema } from 'mongoose';

interface IVisit {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const visitSchema = new Schema<IVisit>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Visit = mongoose.model<IVisit>('Visit', visitSchema);

export default Visit;