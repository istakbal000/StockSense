import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { FixItService } from '../services/fixItService.js';
import prisma from '../db.js';

const router = Router();

// 1. Get Issues
router.get('/issues', authenticate, async (req, res) => {
  try {
    const issues = await FixItService.detectIssues();
    res.json({ issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to detect issues' });
  }
});

// 2. Analyze Specific Issue
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { issue } = req.body;
    const result = await FixItService.analyzeIssue(issue);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to analyze issue' });
  }
});

// 3. Execute Action
router.post('/execute', authenticate, async (req, res) => {
  try {
    const { actionType, payload } = req.body;
    const result = await FixItService.executeAction(actionType, payload, req.user.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to execute action' });
  }
});

// 4. Natural Language Chat
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple natural language parser for tests
    let actionType = 'NONE';
    let payload = {};
    let responseText = "I cannot determine a safe action for that request.";

    if (message.toLowerCase().includes('move') || message.toLowerCase().includes('transfer')) {
      actionType = 'CREATE_TRANSFER_DRAFT';
      responseText = "I can help you transfer stock. Please verify the draft details.";
    } else if (message.toLowerCase().includes('receipt') || message.toLowerCase().includes('restock')) {
      actionType = 'CREATE_RECEIPT_DRAFT';
      responseText = "I will draft a restocking receipt.";
    } else {
      responseText = "I am StockSense AI. I can help you draft receipts, transfers, and explain inventory movements.";
    }

    res.json({
      text: responseText,
      recommendation: { actionType, payload }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
