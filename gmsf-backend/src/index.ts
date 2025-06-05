import { startServer } from './config/server';
 
// Iniciar el servidor
startServer().catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
}); 