const fs = require('fs');
const indexPath = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/index.js';
let indexCode = fs.readFileSync(indexPath, 'utf8');

if (!indexCode.includes('simulationRoutes.js')) {
  indexCode = indexCode.replace(/import anomalyRoutes from '\.\/routes\/anomalyRoutes\.js';/, 
    "import anomalyRoutes from './routes/anomalyRoutes.js';\nimport simulationRoutes from './routes/simulationRoutes.js';");
  
  indexCode = indexCode.replace(/app\.use\('\/api\/anomalies', anomalyRoutes\);/, 
    "app.use('/api/anomalies', anomalyRoutes);\napp.use('/api/simulations', simulationRoutes);");
  
  fs.writeFileSync(indexPath, indexCode);
  console.log('Registered simulations route');
}
