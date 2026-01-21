import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImage extends Document {
  uuid: string;
  event: Types.ObjectId; // Reference to Event
  extension: string;
  aspectRatio?: number;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>({
  uuid: { type: String, required: true, unique: true },
  extension: { type: String, required: true, unique: false },
  aspectRatio: { type: Number },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
