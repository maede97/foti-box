import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImage extends Document {
  uuid: string;
  event: Types.ObjectId; // Reference to Event
  extension: string;
  createdAt: Date;
  size: {
    width: number;
    height: number;
  };
}

const ImageSchema = new Schema<IImage>({
  uuid: { type: String, required: true, unique: true },
  extension: { type: String, required: true, unique: false },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  createdAt: { type: Date, default: Date.now },
  size: {
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
  },
});

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
