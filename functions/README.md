# Academy Manager Cloud Functions

Firebase Cloud Functions για το Academy Manager app.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Deploy Functions

```bash
firebase deploy --only functions
```

### 3. View Logs

```bash
firebase functions:log
```

## Functions

### `updateEventStatuses` (Scheduled)
- **Trigger:** Every 5 minutes
- **Purpose:** Auto-transitions event statuses:
  - `scheduled` → `in-progress` (when start time reached)
  - `in-progress` → `completed` (when end time passed)
- **Region:** europe-west1
- **Cost:** ~17,280 invocations/month (well within free tier of 125,000)

### `updateEventStatusesManual` (HTTP)
- **Trigger:** HTTP endpoint
- **Purpose:** Manual trigger for testing
- **Usage:** 
```bash
curl https://<REGION>-<PROJECT_ID>.cloudfunctions.net/updateEventStatusesManual
```

## Monitoring

Check Firebase Console → Cloud Functions for:
- Execution logs
- Error tracking
- Performance metrics
- Cost analysis

## Notes

- Functions run in `europe-west1` region (change if needed)
- Each function checks all events in Firestore
- Timestamp comparisons are serverside (reliable)
- No client-side dependency - works even if app is offline
