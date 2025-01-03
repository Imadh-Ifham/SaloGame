import mongoose, { Schema, Document, Model } from "mongoose";

interface IReport extends Document {
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema: Schema<IReport> = new mongoose.Schema(
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      createdBy: { type: String, required: true },
    },
    { timestamps: true }
);

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>("Report", reportSchema);

export default Report;