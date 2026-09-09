import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  processNotificationEvent,
  processAllPendingEvents,
  startNotificationQueueListener,
  cleanupDuplicateNotificationTokens,
} from './server/notificationWorker';
import { adminDb } from './server/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Starlit Letters Push Delivery Service',
      timestamp: new Date().toISOString(),
    });
  });

  // Trigger worker to process all pending events
  app.post('/api/notifications/process-queue', async (req, res) => {
    try {
      const results = await processAllPendingEvents(50);
      res.json({
        success: true,
        processedCount: results.length,
        results,
      });
    } catch (err: any) {
      console.error('[API] Error processing notification queue:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Process a specific event by ID
  app.post('/api/notifications/process-event', async (req, res) => {
    try {
      const { eventId } = req.body;
      if (!eventId || typeof eventId !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid eventId is required.' });
      }

      const result = await processNotificationEvent(eventId);
      res.json(result);
    } catch (err: any) {
      console.error('[API] Error processing single event:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Server-side test trigger: creates a pending event and processes it end-to-end
  app.post('/api/notifications/test-event', async (req, res) => {
    try {
      const { userId, title, body, type, url } = req.body;
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ success: false, error: 'Target userId is required.' });
      }

      const eventId = `test_evt_${userId.slice(0, 10)}_${Date.now()}`;
      const eventPayload = {
        userId,
        type: type || 'GENERAL',
        title: (title || 'Starlit Letters Test ✨').slice(0, 200),
        body: (body || 'This is a secure server-side push notification delivery test.').slice(0, 1000),
        data: {
          url: url || '/settings',
          isTest: 'true',
          eventKey: `test_${Date.now()}`,
        },
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        sentAt: null,
      };

      // 1. Create document in Firestore
      await adminDb.collection('notificationEvents').doc(eventId).set(eventPayload);

      // 2. Deliver via worker
      const deliveryResult = await processNotificationEvent(eventId);

      res.json({
        success: true,
        eventId,
        deliveryResult,
      });
    } catch (err: any) {
      console.error('[API] Error in test notification:', err);
      res.status(500).json({ success: false, error: err?.message || 'Server error' });
    }
  });

  // Admin endpoint: Safe cleanup of duplicate or superseded notification tokens
  app.post('/api/notifications/cleanup-tokens', async (req, res) => {
    try {
      const { userId } = req.body || {};
      const result = await cleanupDuplicateNotificationTokens(
        typeof userId === 'string' && userId.trim() ? userId.trim() : undefined
      );
      res.json(result);
    } catch (err: any) {
      console.error('[API] Error running token cleanup:', err);
      res.status(500).json({ success: false, error: err?.message || 'Token cleanup server error' });
    }
  });

  // Start real-time Firestore background queue worker listener
  try {
    startNotificationQueueListener();
  } catch (listenerErr) {
    console.warn('[Server] Notice initializing queue listener:', listenerErr);
  }

  // Serve public assets directly
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development vs Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Starlit Server] Application & Push Worker listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
