# Guide to Creating Placement Events in Firebase Console

## Collection Structure
Collection Name: `placement_events`

## Document Fields

1. **Basic Information**
   - `company_name` (string): Name of the company
   - `title` (string): Title of the placement event
   - `description` (string): Detailed description of the event
   - `event_type` (string): Type of event (e.g., "Placement Drive", "Interview", "Pre-placement Talk")

2. **Timing**
   - `start_date` (timestamp): Event start date and time
   - `end_date` (timestamp): Event end date and time

3. **Location**
   - `location` (string): Where the event will take place

4. **Requirements**
   - `required_documents` (array): List of required documents
   - `eligible_courses` (array): List of eligible courses

## Example Document

```javascript
{
  "company_name": "Tech Corp",
  "title": "Software Engineer Recruitment Drive",
  "description": "Tech Corp is hiring software engineers for their R&D team.",
  "event_type": "Placement Drive",
  "start_date": February 15, 2024, 10:00:00 AM,
  "end_date": February 15, 2024, 5:00:00 PM,
  "location": "Campus Interview Hall",
  "required_documents": [
    "Resume",
    "Academic Transcripts",
    "ID Proof"
  ],
  "eligible_courses": [
    "B.Tech Computer Science",
    "B.Tech Information Technology"
  ],
  "createdBy": "[admin_uid]"
}
```

## Steps to Create a Document

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Click on "Start Collection" (if collection doesn't exist)
4. Enter collection name as "placement_events"
5. Click "Add Document"
6. Add fields one by one according to the structure above
7. For arrays (required_documents, eligible_courses), click the array type and add items
8. For timestamps, use the calendar picker in Firebase Console
9. Add your admin UID in the createdBy field
10. Click "Save" to create the document

## Security Rules
The collection already has security rules set up in firestore.rules:
- Read: Authenticated users can read
- Write (Create/Update/Delete): Admin users or the creator can modify