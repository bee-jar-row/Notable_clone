const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/calendar/callback'
);

class GoogleCalendarController {
  // Step 1 — Redirect user to Google login
  static getAuthUrl(req, res) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly']
    });
    res.json({ authUrl });
  }

  // Step 2 — Handle Google callback, save tokens
  static async handleCallback(req, res) {
    try {
      const { code } = req.query;
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      res.json({
        message: 'Google Calendar connected!',
        tokens
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to connect Google Calendar', error: error.message });
    }
  }

  // Step 3 — Get upcoming events from Google Calendar
  static async getEvents(req, res) {
    try {
      const { access_token, refresh_token } = req.query;
      oauth2Client.setCredentials({ access_token, refresh_token });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const events = response.data.items.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        location: event.location || null,
        description: event.description || null
      }));

      res.json({ events });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
  }
}

module.exports = GoogleCalendarController;