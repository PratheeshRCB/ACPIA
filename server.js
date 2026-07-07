import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import { runAgentCore } from './agentCore.js';
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'kerala-police-cyber-key-2026';
app.use(cors());
app.use(express.json());
// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = db.getTable('users');
  const user = users.find(u => u.username === username && u.passwordHash === password);
  if (!user) {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    }
  });
});
// --- CASE ENDPOINTS ---
app.get('/api/cases', authenticateToken, (req, res) => {
  const cases = db.getTable('cases');
  res.json(cases);
});
app.get('/api/cases/:caseId', authenticateToken, (req, res) => {
  const cases = db.getTable('cases');
  const foundCase = cases.find(c => c.id === req.params.caseId);
  if (!foundCase) {
    return res.status(404).json({ error: 'Case not found' });
  }
  res.json(foundCase);
});
// --- EVIDENCE ENDPOINTS ---
app.get('/api/cases/:caseId/evidence', authenticateToken, (req, res) => {
  const evidence = db.getTable('evidence');
  const caseEvidence = evidence.filter(e => e.caseId === req.params.caseId);
  res.json(caseEvidence);
});
// --- GRAPH NODE/EDGE ENDPOINTS ---
app.get('/api/cases/:caseId/graph', authenticateToken, (req, res) => {
  const nodes = db.getTable('nodes');
  const edges = db.getTable('edges');
  res.json({ nodes, edges });
});
// Confirm proposed link
app.post('/api/cases/:caseId/graph/nodes/:nodeId/confirm', authenticateToken, (req, res) => {
  const { nodeId } = req.params;
  const node = db.update('nodes', 'id', nodeId, { status: 'confirmed' });
  
  if (!node) {
    return res.status(404).json({ error: 'Node not found' });
  }
  // Also confirm edges connected to it that are proposed
  const edges = db.getTable('edges');
  const updatedEdges = edges.map(edge => {
    if ((edge.source === nodeId || edge.target === nodeId) && edge.status === 'proposed') {
      return { ...edge, status: 'confirmed' };
    }
    return edge;
  });
  db.saveTable('edges', updatedEdges);
  res.json({ success: true, node });
});
// Reject proposed link
app.post('/api/cases/:caseId/graph/nodes/:nodeId/reject', authenticateToken, (req, res) => {
  const { nodeId } = req.params;
  
  // Find node to make sure it exists
  const nodes = db.getTable('nodes');
  const exists = nodes.some(n => n.id === nodeId);
  if (!exists) {
    return res.status(404).json({ error: 'Node not found' });
  }
  // Delete node
  db.delete('nodes', 'id', nodeId);
  // Delete connected edges
  const edges = db.getTable('edges');
  const filteredEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
  db.saveTable('edges', filteredEdges);
  res.json({ success: true });
});
// Confirm individual edge
app.post('/api/cases/:caseId/graph/edges/:edgeId/confirm', authenticateToken, (req, res) => {
  const { edgeId } = req.params;
  const edge = db.update('edges', 'id', edgeId, { status: 'confirmed' });
  if (!edge) {
    return res.status(404).json({ error: 'Edge not found' });
  }
  res.json({ success: true, edge });
});
// Reject individual edge
app.post('/api/cases/:caseId/graph/edges/:edgeId/reject', authenticateToken, (req, res) => {
  const { edgeId } = req.params;
  db.delete('edges', 'id', edgeId);
  res.json({ success: true });
});
// --- TIMELINE ENDPOINTS ---
app.get('/api/cases/:caseId/timeline', authenticateToken, (req, res) => {
  const timeline = db.getTable('timeline_events');
  const caseTimeline = timeline.filter(t => t.caseId === req.params.caseId);
  // Sort chronologically
  caseTimeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  res.json(caseTimeline);
});
// --- REPORT ENDPOINTS ---
app.get('/api/cases/:caseId/report', authenticateToken, (req, res) => {
  const reports = db.getTable('case_reports');
  const report = reports.find(r => r.caseId === req.params.caseId);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});
app.put('/api/cases/:caseId/report', authenticateToken, (req, res) => {
  const { content, title, status } = req.body;
  const report = db.update('case_reports', 'caseId', req.params.caseId, {
    content,
    title,
    status,
    generatedAt: new Date().toISOString()
  });
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }
  res.json(report);
});
// --- INGESTION ENDPOINT ---
app.post('/api/cases/:caseId/ingest', authenticateToken, (req, res) => {
  const { caseId } = req.params;
  const { file } = req.body;
  if (!file) {
    return res.status(400).json({ error: 'File metadata required' });
  }
  try {
    const result = runAgentCore(caseId, file);
    res.json(result);
  } catch (error) {
    console.error('Agent Pipeline Error:', error);
    res.status(500).json({ error: 'Agent execution failed: ' + error.message });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  CaseScan Cyber Forensics API Server started     `);
  console.log(`  Access URL: http://localhost:${PORT}          `);
  console.log(`=================================================`);
});
