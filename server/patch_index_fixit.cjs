const fs = require('fs');
const indexPath = 'c:/Users/User/OneDrive/Desktop/StockSense/server/src/index.js';
let indexCode = fs.readFileSync(indexPath, 'utf8');

if (!indexCode.includes('fixItRoutes.js')) {
  indexCode = indexCode.replace(/import simulationRoutes from '\.\/routes\/simulationRoutes\.js';/, 
    "import simulationRoutes from './routes/simulationRoutes.js';\nimport fixItRoutes from './routes/fixItRoutes.js';");
  
  indexCode = indexCode.replace(/app\.use\('\/api\/simulations', simulationRoutes\);/, 
    "app.use('/api/simulations', simulationRoutes);\napp.use('/api/fixit', fixItRoutes);");
  
  fs.writeFileSync(indexPath, indexCode);
  console.log('Registered fixItRoutes in index.js');
}
