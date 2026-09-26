const fs = require('fs');

let apiCode = fs.readFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', 'utf8');

const intelligenceAPIs = `
  // Anomalies
  getAnomalies: (status) => request(\`/anomalies\${status && status !== 'all' ? \`?status=\${status}\` : ''}\`),
  resolveAnomaly: (id, resolutionNotes) => request(\`/anomalies/\${id}/resolve\`, { method: 'PUT', body: JSON.stringify({ resolutionNotes }) }),

  // Simulations
  getSimulations: () => request('/simulations'),
  createSimulation: (body) => request('/simulations', { method: 'POST', body: JSON.stringify(body) }),
  addSimulationEvent: (id, body) => request(\`/simulations/\${id}/events\`, { method: 'POST', body: JSON.stringify(body) }),
  runSimulation: (id) => request(\`/simulations/\${id}/run\`),

  // Fix-It Mode
  analyzeFixIt: (text) => request('/fixit/analyze', { method: 'POST', body: JSON.stringify({ text }) }),
  executeFixIt: (analysisId) => request('/fixit/execute', { method: 'POST', body: JSON.stringify({ analysisId }) })
};`;

if (!apiCode.includes('getAnomalies:')) {
  apiCode = apiCode.replace(/};\s*$/, intelligenceAPIs);
  fs.writeFileSync('c:/Users/User/OneDrive/Desktop/StockSense/client/src/services/api.js', apiCode);
  console.log('Successfully patched api.js');
} else {
  console.log('Already patched!');
}
