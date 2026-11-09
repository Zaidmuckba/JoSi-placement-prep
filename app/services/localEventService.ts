'use client';

interface Event {
  id: string;
  companyName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  requirements: string;
  createdAt: string;
}

class LocalEventService {
  private readonly STORAGE_KEY = 'company_events';

  private getEvents(): Event[] {
    if (typeof window === 'undefined') return [];
    const events = localStorage.getItem(this.STORAGE_KEY);
    return events ? JSON.parse(events) : [];
  }

  private saveEvents(events: Event[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(events));
  }

  async addEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
    const events = this.getEvents();
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    this.saveEvents(events);
    return newEvent.id;
  }

  async getAllEvents(): Promise<Event[]> {
    return this.getEvents().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const localEventService = new LocalEventService();
