'use client';

import { db, auth } from '../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { PlacementEvent, ShortlistedCandidate, PlacementEventStatus } from '../types/calendar';

class CalendarService {
  private eventsCollection = collection(db, 'placement_events');

  private async verifyAdminStatus() {
    try {
      if (!auth.currentUser) {
        throw new Error('Authentication required. Please sign in to continue.');
      }
      
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found. Please contact support.');
      }
      
      const userData = userDoc.data();
      if (!userData || !userData.isAdmin) {
        throw new Error('Missing or insufficient permissions. Admin access required.');
      }
    } catch (error) {
      console.error('Admin verification failed:', error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<PlacementEvent[]> {
    try {
      const now = Timestamp.now();
      const q = query(
        this.eventsCollection,
        where('start_date', '>=', now),
        where('status', 'in', ['UPCOMING', 'IN_PROGRESS'])
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          companyName: data.company_name,
          title: data.title,
          description: data.description,
          eventType: data.event_type,
          startDate: data.start_date,
          endDate: data.end_date,
          location: data.location,
          requiredDocuments: data.required_documents || [],
          eligibilityCriteria: {
            courses: data.eligible_courses || [],
            cgpa: data.cgpa || 0
          },
          status: data.status,
          roles: data.roles || [],
          shortlistedCandidates: data.shortlisted_candidates || [],
          selectedCandidates: data.selected_candidates || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
      }) as PlacementEvent[];

      return events.sort((a, b) => {
        const dateA = a.startDate instanceof Timestamp ? a.startDate.toMillis() : (a.startDate?.toMillis?.() || new Date(a.startDate).getTime());
        const dateB = b.startDate instanceof Timestamp ? b.startDate.toMillis() : (b.startDate?.toMillis?.() || new Date(b.startDate).getTime());
        return dateA - dateB;
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async createPlacementEvent(eventData: Omit<PlacementEvent, 'id'>): Promise<string> {
    try {
      // Verify admin status before creating
      await this.verifyAdminStatus();

      // Ensure all required fields are present and properly formatted
      const now = Timestamp.now();
      const formattedData = {
        company_name: eventData.companyName,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.eventType,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        location: eventData.location || '',
        required_documents: eventData.requiredDocuments || [],
        eligible_courses: eventData.eligibilityCriteria?.courses || [],
        cgpa: eventData.eligibilityCriteria?.cgpa || 0,
        status: eventData.status || 'UPCOMING',
        roles: eventData.roles || [],
        shortlisted_candidates: eventData.shortlistedCandidates || [],
        selected_candidates: eventData.selectedCandidates || [],
        createdBy: auth.currentUser?.uid,
        createdAt: now,
        updatedAt: now
      };

      console.log('Creating event with formatted data:', formattedData);
      const docRef = await addDoc(this.eventsCollection, formattedData);
      console.log('Event created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updatePlacementEvent(eventId: string, eventData: Partial<PlacementEvent>): Promise<void> {
    try {
      // Verify admin status before updating
      await this.verifyAdminStatus();

      const eventRef = doc(this.eventsCollection, eventId);
      // Convert camelCase to snake_case for Firestore
      const formattedData = {
        company_name: eventData.companyName,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.eventType,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        location: eventData.location,
        required_documents: eventData.requiredDocuments,
        eligible_courses: eventData.eligibilityCriteria?.courses,
        cgpa: eventData.eligibilityCriteria?.cgpa,
        status: eventData.status,
        roles: eventData.roles,
        shortlisted_candidates: eventData.shortlistedCandidates,
        selected_candidates: eventData.selectedCandidates,
        updatedAt: Timestamp.now()
      };

      await updateDoc(eventRef, formattedData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deletePlacementEvent(eventId: string): Promise<void> {
    try {
      // Verify admin status before deleting
      await this.verifyAdminStatus();

      const eventRef = doc(this.eventsCollection, eventId);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async getEventById(eventId: string): Promise<PlacementEvent | null> {
    try {
      const eventRef = doc(this.eventsCollection, eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (eventDoc.exists()) {
        const event = eventDoc.data();
        return {
          id: eventDoc.id,
          companyName: event.company_name,
          title: event.title,
          description: event.description,
          eventType: event.event_type,
          startDate: event.start_date,
          endDate: event.end_date,
          location: event.location,
          requiredDocuments: event.required_documents,
          eligibilityCriteria: {
            courses: event.eligible_courses || [],
            cgpa: event.cgpa || 0
          },
          status: event.status,
          roles: event.roles || [],
          shortlistedCandidates: event.shortlisted_candidates || [],
          selectedCandidates: event.selected_candidates || [],
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt
        } as PlacementEvent;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId: string, status: PlacementEventStatus): Promise<void> {
    try {
      await this.verifyAdminStatus();
      await this.updatePlacementEvent(eventId, { status });
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  }

  async addShortlistedCandidate(eventId: string, candidateData: ShortlistedCandidate): Promise<void> {
    try {
      await this.verifyAdminStatus();

      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const shortlistedCandidates = [...(event.shortlistedCandidates || []), candidateData];
      await this.updatePlacementEvent(eventId, { shortlistedCandidates });
    } catch (error) {
      console.error('Error adding shortlisted candidate:', error);
      throw error;
    }
  }

  async updateCandidateStatus(
    eventId: string, 
    studentId: string, 
    status: ShortlistedCandidate['status'],
    feedback?: string
  ): Promise<void> {
    try {
      // Verify admin status before updating
      await this.verifyAdminStatus();

      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const shortlistedCandidates = event.shortlistedCandidates?.map(candidate => 
        candidate.studentId === studentId 
          ? { ...candidate, status, feedback: feedback || candidate.feedback }
          : candidate
      );

      await this.updatePlacementEvent(eventId, { shortlistedCandidates });
    } catch (error) {
      console.error('Error updating candidate status:', error);
      throw error;
    }
  }

  async addSelectedCandidate(eventId: string, studentId: string): Promise<void> {
    try {
      // Verify admin status before adding
      await this.verifyAdminStatus();

      const event = await this.getEventById(eventId);
      if (!event) throw new Error('Event not found');

      const selectedCandidates = [...(event.selectedCandidates || []), studentId];
      await this.updatePlacementEvent(eventId, { selectedCandidates });
    } catch (error) {
      console.error('Error adding selected candidate:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
