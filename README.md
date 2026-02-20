# Faculty Front Page (Telemetry to Google Sheet)

This repo is a Vite + React + TypeScript + Tailwind starter using your Faculty Front Page UI.
It adds a lightweight telemetry logger that posts xAPI-shaped events to a Google Sheet endpoint.

## Run locally

1) Install dependencies
   npm install

2) Start dev server
   npm run dev

## Telemetry options

### Mock mode
Leave Telemetry disabled, or keep Endpoint blank.
Events will print to the browser console.

### Real mode: Google Sheet endpoint
1) Create a Google Sheet with a tab named: Log
2) Add headers in row 1:
   timestamp, actor_id, actor_name, actor_role, verb, object_id, object_name, score, raw_json

3) Apps Script
   Extensions -> Apps Script
   Paste the code from scripts/apps-script/telemetry.gs
   Deploy as a Web App:
   - Execute as: Me
   - Access: Anyone with the link (for testing)

4) Copy the Web App URL into Settings -> Endpoint URL
5) Enable Telemetry and Save

## Security note
If this app is public, do not use the open endpoint setting for long.
Add an auth check in the Apps Script and set Key and Secret in Settings.
