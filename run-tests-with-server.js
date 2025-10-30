#!/usr/bin/env node

// Ejecutar las pruebas con configuración específica
const { exec } = require('child_process');

console.log('🚀 Iniciando servidor para pruebas...');

// Iniciar el servidor en segundo plano
const server = exec('npm start', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error del servidor: ${error}`);
  }
});

// Esperar un momento para que el servidor inicie
setTimeout(() => {
  console.log('🧪 Ejecutando pruebas...');
  
  // Ejecutar las pruebas
  const tests = exec('npm run test:cucumber', (error, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    // Terminar el servidor
    console.log('🛑 Deteniendo servidor...');
    process.kill(server.pid, 'SIGTERM');
    
    process.exit(error ? 1 : 0);
  });
}, 5000);