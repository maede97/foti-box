import Event from '@/models/event';
import { connectToDatabase } from './mongodb';

export async function requireEventAdminAccess(eventId: string, adminPassword: string) {
  await connectToDatabase();

  if (!eventId || !adminPassword) {
    return { error: 'Fehlende Event ID oder Admin Passwort', status: 400 } as const;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return { error: 'Event nicht gefunden', status: 404 } as const;
  }

  if (event.admin_password !== adminPassword) {
    return { error: 'Nicht autorisiert', status: 401 } as const;
  }

  return { event } as const;
}
