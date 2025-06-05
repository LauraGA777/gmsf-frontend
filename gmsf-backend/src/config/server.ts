import { env } from './env';
import { testConnection } from './db';
import App from '../app';

// Después de inicializar el servidor
// Ejecutar testConnection antes de iniciar el servidor
export const startServer = async () => {
    await testConnection();
    App.listen(env.PORT, () => {
        console.log(`Server running on port http://localhost:${env.PORT}`);
    });
}; 