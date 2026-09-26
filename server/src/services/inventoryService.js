import prisma from '../db.js';

export class InventoryService {
  static async getBalance(productId, locationId, batchId = null) {
    const record = await prisma.inventoryBalance.findFirst({
      where: { productId, locationId, batchId }
    });
    return record ? record.quantity : 0;
  }

  static async getTotalStock(productId, batchId = undefined) {
    const whereClause = { productId };
    if (batchId !== undefined) whereClause.batchId = batchId;
    const balances = await prisma.inventoryBalance.findMany({
      where: whereClause
    });
    return balances.reduce((sum, b) => sum + b.quantity, 0);
  }

  static async validateReceipt(receiptId, userId) {
    return await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: receiptId },
        include: { items: { include: { product: true } }, destinationLocation: true }
      });

      if (!receipt) throw new Error('Receipt not found');
      if (receipt.status === 'Done') throw new Error('Receipt has already been validated and marked Done');
      if (receipt.status === 'Canceled') throw new Error('Canceled receipts cannot be validated');
      if (!receipt.items || receipt.items.length === 0) throw new Error('Receipt must contain at least one product item');

      for (const item of receipt.items) {
        if (item.quantity <= 0) throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        if (item.product.isBatchTracked && !item.batchId) {
          throw new Error(`Product ${item.product.name} is batch tracked. A batch must be specified.`);
        }

        const existingBalance = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: receipt.destinationLocationId,
            batchId: item.batchId || null
          }
        });

        if (existingBalance) {
          await tx.inventoryBalance.update({
            where: { id: existingBalance.id },
            data: { quantity: { increment: item.quantity } }
          });
        } else {
          await tx.inventoryBalance.create({
            data: {
              productId: item.productId,
              locationId: receipt.destinationLocationId,
              batchId: item.batchId || null,
              quantity: item.quantity
            }
          });
        }

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'RECEIPT',
            referenceDocument: receipt.receiptNumber,
            productId: item.productId,
            batchId: item.batchId || null,
            quantity: item.quantity,
            toLocationId: receipt.destinationLocationId,
            notes: `Received from ${receipt.supplierName}${item.notes ? ` - ${item.notes}` : ''}`,
            userId: userId || receipt.createdByUserId
          }
        });
      }

      return await tx.receipt.update({
        where: { id: receiptId },
        data: { status: 'Done', validatedAt: new Date() },
        include: { items: { include: { product: true } }, destinationLocation: true }
      });
    });
  }

  static async validateDelivery(deliveryId, userId) {
    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.deliveryOrder.findUnique({
        where: { id: deliveryId },
        include: { items: { include: { product: true } }, sourceLocation: true }
      });

      if (!delivery) throw new Error('Delivery order not found');
      if (delivery.status === 'Done') throw new Error('Delivery order has already been validated and completed');
      if (delivery.status === 'Canceled') throw new Error('Canceled delivery orders cannot be validated');
      if (!delivery.items || delivery.items.length === 0) throw new Error('Delivery order must contain at least one item');

      for (const item of delivery.items) {
        if (item.quantity <= 0) throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        if (item.product.isBatchTracked && !item.batchId) {
          throw new Error(`Product ${item.product.name} is batch tracked. A batch must be specified.`);
        }

        const currentBalance = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: delivery.sourceLocationId,
            batchId: item.batchId || null
          }
        });

        const available = currentBalance ? currentBalance.quantity : 0;
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product.name}" (SKU: ${item.product.sku}) at location "${delivery.sourceLocation.name}". Available: ${available}, Requested: ${item.quantity}`);
        }
      }

      for (const item of delivery.items) {
        const currentBalance = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: delivery.sourceLocationId,
            batchId: item.batchId || null
          }
        });

        await tx.inventoryBalance.update({
          where: { id: currentBalance.id },
          data: { quantity: { decrement: item.quantity } }
        });

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'DELIVERY',
            referenceDocument: delivery.orderNumber,
            productId: item.productId,
            batchId: item.batchId || null,
            quantity: -item.quantity,
            fromLocationId: delivery.sourceLocationId,
            notes: `Delivered to customer ${delivery.customerName}`,
            userId: userId || delivery.createdByUserId
          }
        });
      }

      return await tx.deliveryOrder.update({
        where: { id: deliveryId },
        data: { status: 'Done', pickStatus: 'Picked', packStatus: 'Packed', validatedAt: new Date() },
        include: { items: { include: { product: true } }, sourceLocation: true }
      });
    });
  }

  static async validateTransfer(transferId, userId) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.internalTransfer.findUnique({
        where: { id: transferId },
        include: { items: { include: { product: true } }, sourceLocation: true, destinationLocation: true }
      });

      if (!transfer) throw new Error('Internal transfer not found');
      if (transfer.status === 'Done') throw new Error('Internal transfer has already been completed');
      if (transfer.status === 'Canceled') throw new Error('Canceled transfers cannot be validated');
      if (transfer.sourceLocationId === transfer.destinationLocationId) throw new Error('Source location and destination location must be different');
      if (!transfer.items || transfer.items.length === 0) throw new Error('Transfer must contain at least one item');

      for (const item of transfer.items) {
        if (item.quantity <= 0) throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        if (item.product.isBatchTracked && !item.batchId) {
          throw new Error(`Product ${item.product.name} is batch tracked. A batch must be specified.`);
        }

        const sourceBal = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: transfer.sourceLocationId,
            batchId: item.batchId || null
          }
        });

        const available = sourceBal ? sourceBal.quantity : 0;
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for "${item.product.name}" at source "${transfer.sourceLocation.name}". Available: ${available}, Transfer requested: ${item.quantity}`);
        }
      }

      for (const item of transfer.items) {
        const sourceBal = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: transfer.sourceLocationId,
            batchId: item.batchId || null
          }
        });

        await tx.inventoryBalance.update({
          where: { id: sourceBal.id },
          data: { quantity: { decrement: item.quantity } }
        });

        const destBal = await tx.inventoryBalance.findFirst({
          where: {
            productId: item.productId,
            locationId: transfer.destinationLocationId,
            batchId: item.batchId || null
          }
        });

        if (destBal) {
          await tx.inventoryBalance.update({
            where: { id: destBal.id },
            data: { quantity: { increment: item.quantity } }
          });
        } else {
          await tx.inventoryBalance.create({
            data: {
              productId: item.productId,
              locationId: transfer.destinationLocationId,
              batchId: item.batchId || null,
              quantity: item.quantity
            }
          });
        }

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'INTERNAL_TRANSFER',
            referenceDocument: transfer.transferNumber,
            productId: item.productId,
            batchId: item.batchId || null,
            quantity: item.quantity,
            fromLocationId: transfer.sourceLocationId,
            toLocationId: transfer.destinationLocationId,
            notes: `Internal transfer from ${transfer.sourceLocation.name} to ${transfer.destinationLocation.name}`,
            userId: userId || transfer.createdByUserId
          }
        });
      }

      return await tx.internalTransfer.update({
        where: { id: transferId },
        data: { status: 'Done', validatedAt: new Date() },
        include: { items: { include: { product: true } }, sourceLocation: true, destinationLocation: true }
      });
    });
  }

  static async applyAdjustment(productId, locationId, physicalCount, reason, userId, batchId = null) {
    if (physicalCount < 0) throw new Error('Physical count cannot be negative');

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      
      if (product.isBatchTracked && !batchId) {
        throw new Error(`Product ${product.name} is batch tracked. A batch must be specified for adjustment.`);
      }

      const location = await tx.location.findUnique({
        where: { id: locationId },
        include: { warehouse: true }
      });
      if (!location) throw new Error('Location not found');

      const existingBalance = await tx.inventoryBalance.findFirst({
        where: { productId, locationId, batchId: batchId || null }
      });

      const recordedQuantity = existingBalance ? existingBalance.quantity : 0;
      const difference = physicalCount - recordedQuantity;

      if (existingBalance) {
        await tx.inventoryBalance.update({
          where: { id: existingBalance.id },
          data: { quantity: physicalCount }
        });
      } else {
        await tx.inventoryBalance.create({
          data: { productId, locationId, batchId: batchId || null, quantity: physicalCount }
        });
      }

      const count = await tx.inventoryAdjustment.count();
      const adjNum = `ADJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          adjustmentNumber: adjNum,
          productId,
          locationId,
          batchId: batchId || null,
          recordedQuantity,
          physicalCount,
          difference,
          reason: reason || 'Physical inventory cycle count reconciliation',
          status: 'Done',
          validatedAt: new Date(),
          createdByUserId: userId
        },
        include: { product: true, location: true }
      });

      await tx.stockLedgerEntry.create({
        data: {
          movementType: 'ADJUSTMENT',
          referenceDocument: adjNum,
          productId,
          batchId: batchId || null,
          quantity: difference,
          fromLocationId: difference < 0 ? locationId : undefined,
          toLocationId: difference > 0 ? locationId : undefined,
          notes: `Adjustment: ${difference >= 0 ? '+' : ''}${difference} (${reason || 'Count reconciliation'})`,
          userId
        }
      });

      
      // Check for Anomalies
      const LARGE_ADJUSTMENT_THRESHOLD = 100;
      if (Math.abs(difference) > LARGE_ADJUSTMENT_THRESHOLD) {
        await tx.inventoryAnomaly.create({
          data: {
            type: 'LARGE_ADJUSTMENT',
            severity: 'HIGH',
            description: `Adjustment of ${difference} units exceeds threshold of ${LARGE_ADJUSTMENT_THRESHOLD}`,
            productId,
            locationId,
            referenceDocument: adjNum
          }
        });
      }

      // Check for Repeated Corrections
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = await tx.inventoryAdjustment.count({
        where: {
          productId,
          locationId,
          createdAt: { gte: sevenDaysAgo }
        }
      });

      if (recentCount >= 3) { // This is the 4th+ adjustment in 7 days
        await tx.inventoryAnomaly.create({
          data: {
            type: 'REPEATED_CORRECTION',
            severity: 'MEDIUM',
            description: `More than 3 adjustments for this product/location in the last 7 days. Possible underlying issue.`,
            productId,
            locationId,
            referenceDocument: adjNum
          }
        });
      }

      return adjustment;

    });
  }
}