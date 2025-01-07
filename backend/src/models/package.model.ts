import mongoose, { Document, Model, Schema } from 'mongoose';

// Define an interface for the Package document
interface IPackage extends Document {
  name: string;
  price: number;
  image: string;
  description:string;
}

// Define the schema with type annotations
const packageSchema: Schema<IPackage> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
        type: String,
        required: true,
      },
  },
  {
    timestamps: true, // Ensures createdAt and updatedAt fields are added
  }
);

// Define the model with the interface
const Package: Model<IPackage> = mongoose.model<IPackage>('Package', packageSchema);

export default Package;
