import Event from '@/models/event';
import { connectToDatabase } from './mongodb';

export async function verifyEventPassword(eventName: string, password: string) {
  await connectToDatabase();

  const event = await Event.findOne({ name: eventName, active: true });
  if (!event) return false;
  return event.password === password;
}
