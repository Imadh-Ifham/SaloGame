import mongoose, { Schema, Document } from 'mongoose';

export interface IEventSchema extends Document {
    name: string;
    description: string;
    date: Date;
    time: string;
    image: string;
    isCancelled?: boolean;
    isCompleted?: boolean;
}

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    image: { type: String, required: true },
    isCancelled: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
})

// Create and Export Model
export default mongoose.model<IEventSchema>("Event", EventSchema);