import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import warehouseRoutes from './routes/warehouseRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import adjustmentRoutes from './routes/adjustmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import anomalyRoutes from './routes/anomalyRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import fixItRoutes from './routes/fixItRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    system: 'StockSense Modular Inventory Management System',
    timestamp: new Date().toISOString()
  });
});

// Mount modular domain routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/anomalies', anomalyRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/fixit', fixItRoutes);
app.use('/api/ledger', ledgerRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error occurred' });
});

app.listen(PORT, () => {
  console.log(`🚀 StockSense Server running smoothly at http://localhost:${PORT}`);
});