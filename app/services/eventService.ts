'use client';

import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

interface Event {
  companyName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  requirements: string;
  createdAt: any;
}

class EventService {
  async addEvent(eventData: Omit<Event, 'createdAt'>) {
    try {
      const eventsRef = collection(db, 'company_events');
      const newEvent = {
        ...eventData,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(eventsRef, newEvent);
      return docRef.id;
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async getEvents() {
    try {
      const eventsRef = collection(db, 'company_events');
      const q = query(eventsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();
