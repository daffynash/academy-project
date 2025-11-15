/* global exports, require */
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Update Event Statuses
 * Runs every 5 minutes to automatically transition event statuses:
 * - scheduled → in-progress (when start time is reached)
 * - in-progress → completed (when end time is passed)
 * 
 * This function ensures reliable status updates without depending on client-side activity
 */
exports.updateEventStatuses = functions
  .region('europe-west1')
  .pubsub.schedule('every 5 minutes')
  .onRun(async () => {
    try {
      const now = admin.firestore.Timestamp.now();
      console.log(`[${new Date().toISOString()}] Checking event statuses...`);

      const eventsRef = db.collection('events');

      // Get ALL events and filter client-side to avoid index requirements
      const allEvents = await eventsRef.get();
      
      const updates = [];
      
      allEvents.forEach(doc => {
        const data = doc.data();
        
        // Priority: Check if end time has passed first
        if (data.endDate && data.endDate <= now) {
          // If end time has passed, go straight to completed (regardless of current status)
          if (data.status !== 'completed' && data.status !== 'cancelled') {
            console.log(`  → completed: "${data.title}" (from ${data.status})`);
            updates.push(doc.ref.update({
              status: 'completed',
              updatedAt: admin.firestore.Timestamp.now()
            }));
          }
        }
        // Then check if start time has passed (but end time hasn't)
        else if (data.status === 'scheduled' && data.startDate && data.startDate <= now) {
          console.log(`  → in-progress: "${data.title}"`);
          updates.push(doc.ref.update({
            status: 'in-progress',
            updatedAt: admin.firestore.Timestamp.now()
          }));
        }
      });

      await Promise.all(updates);
      console.log(`[✓] Updated ${updates.length} event(s)`);

      return null;
    } catch (error) {
      console.error('[✗ ERROR]', error.message);
      throw error;
    }
  });

/**
 * Optional: HTTP Trigger for Manual Testing
 * Call this endpoint to manually trigger the status update check
 * Usage: curl https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/updateEventStatusesManual
 */
exports.updateEventStatusesManual = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Optional: Add authentication check here
    // if (!isAuthorized(req)) { return res.status(403).send('Unauthorized'); }

    try {
      const now = admin.firestore.Timestamp.now();
      console.log(`[Manual - ${new Date().toISOString()}] Checking...`);

      // Test: Get collection info
      const allEvents = await db.collection('events').get();
      console.log(`Total events found: ${allEvents.size}`);

      const updates = [];
      
      allEvents.forEach(doc => {
        const data = doc.data();
        console.log(`Event: ${data.title}, status: ${data.status}`);
        
        // Priority: Check if end time has passed first
        if (data.endDate && data.endDate <= now) {
          // If end time has passed, go straight to completed (regardless of current status)
          if (data.status !== 'completed' && data.status !== 'cancelled') {
            updates.push(doc.ref.update({
              status: 'completed',
              updatedAt: admin.firestore.Timestamp.now()
            }));
          }
        }
        // Then check if start time has passed (but end time hasn't)
        else if (data.status === 'scheduled' && data.startDate && data.startDate <= now) {
          updates.push(doc.ref.update({
            status: 'in-progress',
            updatedAt: admin.firestore.Timestamp.now()
          }));
        }
      });

      await Promise.all(updates);

      res.json({
        success: true,
        updated: updates.length,
        total: allEvents.size
      });
    } catch (error) {
      console.error('[✗ Error]', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        code: error.code
      });
    }
  });
