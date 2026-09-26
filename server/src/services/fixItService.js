import prisma from '../db.js';
import { aiProvider } from './aiProvider.js';
import { InventoryService } from './inventoryService.js';

export class FixItService {
  
  // 1. Detect Issues Deterministically
  static async detectIssues() {
    const issues = [];
    
    // Detect LOW_STOCK & OUT_OF_STOCK
    const products = await prisma.product.findMany({
      include: {
        balances: { include: { location: { include: { warehouse: true } } } },
        reorderingRules: true
      }
    });

    for (const p of products) {
      const totalStock = p.balances.reduce((sum, b) => sum + b.quantity, 0);
      
      if (totalStock === 0) {
        issues.push({
          id: `OOS-${p.id}`,
          type: 'OUT_OF_STOCK',
          severity: 'CRITICAL',
          productId: p.id,
          productName: p.name,
          currentStock: 0,
          message: `${p.name} is completely out of stock.`
        });
        continue;
      }

      // Check reorder rules (simplistic approach: compare total stock to max reorder point)
      let maxReorderPoint = 0;
      for (const rule of p.reorderingRules) {
        if (rule.minQuantity > maxReorderPoint) maxReorderPoint = rule.minQuantity;
      }

      if (maxReorderPoint > 0 && totalStock < maxReorderPoint) {
        issues.push({
          id: `LOW-${p.id}`,
          type: 'LOW_STOCK',
          severity: 'HIGH',
          productId: p.id,
          productName: p.name,
          currentStock: totalStock,
          reorderLevel: maxReorderPoint,
          message: `${p.name} is below reorder level (${totalStock} < ${maxReorderPoint}).`
        });
      }
    }

    return issues;
  }

  // 2. Analyze Issue using AI
  static async analyzeIssue(issue) {
    // Gather evidence
    const pendingReceipts = await prisma.receipt.findMany({
      where: {
        status: { in: ['Draft', 'Waiting', 'Ready'] },
        items: { some: { productId: issue.productId } }
      },
      include: { items: true }
    });

    const recentMovements = await prisma.stockLedgerEntry.findMany({
      where: { productId: issue.productId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const prompt = `
      Analyze this inventory issue:
      Issue Type: ${issue.type}
      Product: ${issue.productName}
      Current Stock: ${issue.currentStock}
      Reorder Level: ${issue.reorderLevel || 'N/A'}
      
      Pending Receipts: ${JSON.stringify(pendingReceipts)}
      Recent Ledger Movements: ${JSON.stringify(recentMovements)}
      
      Return a JSON object with:
      - facts (array of strings)
      - calculations (array of strings)
      - evidence (array of strings)
      - recommendation (object with actionType and description)
      - requiresConfirmation (boolean)
    `;

    const schema = {
      type: "OBJECT",
      properties: {
        facts: { type: "ARRAY", items: { type: "STRING" } },
        calculations: { type: "ARRAY", items: { type: "STRING" } },
        evidence: { type: "ARRAY", items: { type: "STRING" } },
        recommendation: { 
          type: "OBJECT", 
          properties: { 
            actionType: { type: "STRING" }, 
            description: { type: "STRING" },
            payload: { type: "OBJECT" }
          }
        },
        requiresConfirmation: { type: "BOOLEAN" }
      }
    };

    const analysis = await aiProvider.generateStructured(prompt, schema);
    
    return {
      issue,
      analysis,
      evidence: { pendingReceipts, recentMovements }
    };
  }

  // 3. Execute Action securely
  static async executeAction(actionType, payload, userId) {
    if (actionType === 'CREATE_RECEIPT_DRAFT') {
      const count = await prisma.receipt.count();
      const receiptNumber = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      // Require destination location (fallback to first location)
      let destLocId = payload.destinationLocationId;
      if (!destLocId) {
        const loc = await prisma.location.findFirst();
        destLocId = loc.id;
      }

      const receipt = await prisma.receipt.create({
        data: {
          receiptNumber,
          supplierName: payload.supplierName || 'System Vendor',
          destinationLocationId: destLocId,
          status: 'Ready',
          createdByUserId: userId,
          items: {
            create: [
              {
                productId: payload.productId,
                quantity: payload.quantity || 50
              }
            ]
          }
        }
      });
      return { success: true, receipt, message: 'Receipt draft created successfully.' };
    }
    
    if (actionType === 'CREATE_TRANSFER_DRAFT') {
      const count = await prisma.internalTransfer.count();
      const transferNumber = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      const transfer = await prisma.internalTransfer.create({
        data: {
          transferNumber,
          sourceLocationId: payload.sourceLocationId,
          destinationLocationId: payload.destinationLocationId,
          status: 'Ready',
          createdByUserId: userId,
          items: {
            create: [
              {
                productId: payload.productId,
                quantity: payload.quantity
              }
            ]
          }
        }
      });
      return { success: true, transfer, message: 'Transfer draft created successfully.' };
    }

    if (actionType === 'EXECUTE_TRANSFER') {
      // Validate transfer securely via inventory service
      const transferId = payload.transferId;
      const res = await InventoryService.validateTransfer(transferId, userId);
      return { success: true, message: 'Transfer validated and executed.', data: res };
    }

    throw new Error(`Unsupported action type: ${actionType}`);
  }
}
