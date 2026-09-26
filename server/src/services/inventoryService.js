import prisma from '../db.js';

export class InventoryService {
  /**
   * Get balance for a specific product at a specific location
   */
  static async getBalance(productId, locationId) {
    const record = await prisma.inventoryBalance.findUnique({
      where: {
        productId_locationId: { productId, locationId }
      }
    });
    return record ? record.quantity : 0;
  }

  /**
   * Get total stock for a product across all locations
   */
  static async getTotalStock(productId) {
    const balances = await prisma.inventoryBalance.findMany({
      where: { productId }
    });
    return balances.reduce((sum, b) => sum + b.quantity, 0);
  }

  /**
   * Validate and Apply Receipt (Incoming Stock)
   * Formula: Destination Stock = Previous Destination Stock + Received Qty
   * Generates Stock Ledger entry
   */
  static async validateReceipt(receiptId, userId) {
    return await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.findUnique({
        where: { id: receiptId },
        include: { items: { include: { product: true } }, destinationLocation: true }
      });

      if (!receipt) {
        throw new Error('Receipt not found');
      }

      if (receipt.status === 'Done') {
        throw new Error('Receipt has already been validated and marked Done');
      }

      if (receipt.status === 'Canceled') {
        throw new Error('Canceled receipts cannot be validated');
      }

      if (!receipt.items || receipt.items.length === 0) {
        throw new Error('Receipt must contain at least one product item');
      }

      for (const item of receipt.items) {
        if (item.quantity <= 0) {
          throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        }

        // Upsert inventory balance at destination location
        await tx.inventoryBalance.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: receipt.destinationLocationId
            }
          },
          update: {
            quantity: {
              increment: item.quantity
            }
          },
          create: {
            productId: item.productId,
            locationId: receipt.destinationLocationId,
            quantity: item.quantity
          }
        });

        // Create Stock Ledger Entry
        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'RECEIPT',
            referenceDocument: receipt.receiptNumber,
            productId: item.productId,
            quantity: item.quantity,
            toLocationId: receipt.destinationLocationId,
            notes: `Received from ${receipt.supplierName}${item.notes ? ` - ${item.notes}` : ''}`,
            userId: userId || receipt.createdByUserId
          }
        });
      }

      // Update receipt status to Done
      const updatedReceipt = await tx.receipt.update({
        where: { id: receiptId },
        data: {
          status: 'Done',
          validatedAt: new Date()
        },
        include: { items: { include: { product: true } }, destinationLocation: true }
      });

      return updatedReceipt;
    });
  }

  /**
   * Validate and Apply Delivery Order (Outgoing Stock)
   * Formula: Source Stock = Previous Source Stock - Delivered Qty
   * Safeguard: Reject if available stock < requested quantity
   * Generates Stock Ledger entry
   */
  static async validateDelivery(deliveryId, userId) {
    return await prisma.$transaction(async (tx) => {
      const delivery = await tx.deliveryOrder.findUnique({
        where: { id: deliveryId },
        include: { items: { include: { product: true } }, sourceLocation: true }
      });

      if (!delivery) {
        throw new Error('Delivery order not found');
      }

      if (delivery.status === 'Done') {
        throw new Error('Delivery order has already been validated and completed');
      }

      if (delivery.status === 'Canceled') {
        throw new Error('Canceled delivery orders cannot be validated');
      }

      if (!delivery.items || delivery.items.length === 0) {
        throw new Error('Delivery order must contain at least one item');
      }

      // Check available stock first for all items
      for (const item of delivery.items) {
        if (item.quantity <= 0) {
          throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        }

        const currentBalance = await tx.inventoryBalance.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: delivery.sourceLocationId
            }
          }
        });

        const available = currentBalance ? currentBalance.quantity : 0;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.product.name}" (SKU: ${item.product.sku}) at location "${delivery.sourceLocation.name}". Available: ${available}, Requested: ${item.quantity}`
          );
        }
      }

      // Apply deductions and create ledger entries
      for (const item of delivery.items) {
        await tx.inventoryBalance.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: delivery.sourceLocationId
            }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'DELIVERY',
            referenceDocument: delivery.orderNumber,
            productId: item.productId,
            quantity: -item.quantity,
            fromLocationId: delivery.sourceLocationId,
            notes: `Delivered to customer ${delivery.customerName}`,
            userId: userId || delivery.createdByUserId
          }
        });
      }

      // Update Delivery status to Done and mark pick/pack as complete
      const updatedDelivery = await tx.deliveryOrder.update({
        where: { id: deliveryId },
        data: {
          status: 'Done',
          pickStatus: 'Picked',
          packStatus: 'Packed',
          validatedAt: new Date()
        },
        include: { items: { include: { product: true } }, sourceLocation: true }
      });

      return updatedDelivery;
    });
  }

  /**
   * Validate and Apply Internal Transfer
   * Formula:
   *   Source = Source - Quantity
   *   Destination = Destination + Quantity
   *   Total company stock remains unchanged!
   * Safeguard: Source != Destination, Source available >= quantity
   */
  static async validateTransfer(transferId, userId) {
    return await prisma.$transaction(async (tx) => {
      const transfer = await tx.internalTransfer.findUnique({
        where: { id: transferId },
        include: {
          items: { include: { product: true } },
          sourceLocation: true,
          destinationLocation: true
        }
      });

      if (!transfer) {
        throw new Error('Internal transfer not found');
      }

      if (transfer.status === 'Done') {
        throw new Error('Internal transfer has already been completed');
      }

      if (transfer.status === 'Canceled') {
        throw new Error('Canceled transfers cannot be validated');
      }

      if (transfer.sourceLocationId === transfer.destinationLocationId) {
        throw new Error('Source location and destination location must be different');
      }

      if (!transfer.items || transfer.items.length === 0) {
        throw new Error('Transfer must contain at least one item');
      }

      // Verify stock availability at source
      for (const item of transfer.items) {
        if (item.quantity <= 0) {
          throw new Error(`Quantity for product ${item.product.name} must be greater than zero`);
        }

        const sourceBal = await tx.inventoryBalance.findUnique({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId
            }
          }
        });

        const available = sourceBal ? sourceBal.quantity : 0;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for "${item.product.name}" at source "${transfer.sourceLocation.name}". Available: ${available}, Transfer requested: ${item.quantity}`
          );
        }
      }

      // Deduct from source and add to destination
      for (const item of transfer.items) {
        await tx.inventoryBalance.update({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.sourceLocationId
            }
          },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });

        await tx.inventoryBalance.upsert({
          where: {
            productId_locationId: {
              productId: item.productId,
              locationId: transfer.destinationLocationId
            }
          },
          update: {
            quantity: {
              increment: item.quantity
            }
          },
          create: {
            productId: item.productId,
            locationId: transfer.destinationLocationId,
            quantity: item.quantity
          }
        });

        await tx.stockLedgerEntry.create({
          data: {
            movementType: 'INTERNAL_TRANSFER',
            referenceDocument: transfer.transferNumber,
            productId: item.productId,
            quantity: item.quantity,
            fromLocationId: transfer.sourceLocationId,
            toLocationId: transfer.destinationLocationId,
            notes: `Internal transfer from ${transfer.sourceLocation.name} to ${transfer.destinationLocation.name}`,
            userId: userId || transfer.createdByUserId
          }
        });
      }

      const updated = await tx.internalTransfer.update({
        where: { id: transferId },
        data: {
          status: 'Done',
          validatedAt: new Date()
        },
        include: {
          items: { include: { product: true } },
          sourceLocation: true,
          destinationLocation: true
        }
      });

      return updated;
    });
  }

  /**
   * Apply Inventory Adjustment
   * Formula:
   *   Difference = Physical Count - Recorded Stock
   *   New Stock = Physical Count
   * Generates Stock Ledger entry
   */
  static async applyAdjustment(
  productId,
  locationId,
  physicalCount,
  reason,
  userId)
  {
    if (physicalCount < 0) {
      throw new Error('Physical count cannot be negative');
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const location = await tx.location.findUnique({
        where: { id: locationId },
        include: { warehouse: true }
      });
      if (!location) throw new Error('Location not found');

      const existingBalance = await tx.inventoryBalance.findUnique({
        where: { productId_locationId: { productId, locationId } }
      });

      const recordedQuantity = existingBalance ? existingBalance.quantity : 0;
      const difference = physicalCount - recordedQuantity;

      // Update balance to exact physical count
      await tx.inventoryBalance.upsert({
        where: { productId_locationId: { productId, locationId } },
        update: { quantity: physicalCount },
        create: { productId, locationId, quantity: physicalCount }
      });

      // Generate adjustment document number
      const count = await tx.inventoryAdjustment.count();
      const adjNum = `ADJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

      const adjustment = await tx.inventoryAdjustment.create({
        data: {
          adjustmentNumber: adjNum,
          productId,
          locationId,
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

      // Stock Ledger entry
      await tx.stockLedgerEntry.create({
        data: {
          movementType: 'ADJUSTMENT',
          referenceDocument: adjNum,
          productId,
          quantity: difference,
          fromLocationId: difference < 0 ? locationId : undefined,
          toLocationId: difference > 0 ? locationId : undefined,
          notes: `Adjustment: ${difference >= 0 ? '+' : ''}${difference} (${reason || 'Count reconciliation'})`,
          userId
        }
      });

      return adjustment;
    });
  }
}