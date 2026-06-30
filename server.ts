import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getAllMetrics, getSystemSpecs } from './electron/services/system';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request parsing
  app.use(express.json());

  // 1. API - Get static specs
  app.get('/api/specs', async (req, res) => {
    try {
      const specs = await getSystemSpecs();
      res.json(specs);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system specs' });
    }
  });

  // 2. API - Get single snapshot of current metrics
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await getAllMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  });

  // 3. API - Server-Sent Events (SSE) for Real-Time Streaming (500ms intervals)
  app.get('/api/metrics/live', (req, res) => {
    // Write headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // Establish the connection immediately

    console.log('[SSE] Client connected to live metrics stream');

    // Send initial snapshot immediately
    getAllMetrics().then((metrics) => {
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    }).catch(err => console.error('[SSE] Initial fetch failed:', err));

    // Polling interval of 500ms
    const intervalId = setInterval(async () => {
      try {
        const metrics = await getAllMetrics();
        res.write(`data: ${JSON.stringify(metrics)}\n\n`);
      } catch (error) {
        console.error('[SSE] Error fetching metrics:', error);
      }
    }, 500);

    // Clean up when client disconnects
    req.on('close', () => {
      console.log('[SSE] Client disconnected');
      clearInterval(intervalId);
      res.end();
    });
  });

  // 4. Vite Dev Server Middleware or Static Build Service
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
    console.log(`Resource Monitor Web Server is live at http://localhost:${PORT}`);
  });
}

startServer();
