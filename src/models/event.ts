import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  password: string;
  active: boolean;
}

const EventSchema = new Schema<IEvent>({
  name: { type: String, required: true },
  password: { type: String, required: true },
  active: { type: Boolean, default: false },
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
