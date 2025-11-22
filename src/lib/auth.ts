import Event from '@/models/event';

export async function verifyEventPassword(eventName: string, password: string) {
  const event = await Event.findOne({ name: eventName, active: true });
  if (!event) return false;
  return event.password === password;
}
