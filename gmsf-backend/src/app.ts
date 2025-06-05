import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import membershipRoutes from './routes/membership.routes';
import contractRoutes from './routes/contract.routes';
import clientRoutes from './routes/client.routes';
import scheduleRoutes from './routes/schedule.routes';
import { errorHandler } from './middlewares/error.middleware';

interface AppConfig {
    // Add properties as needed
}

class App {
    public app: Application;
    private appConfig: AppConfig = {};  // Initialize with empty object

    // Configuración inicial
    private setupConfig(): void {
        this.app.set('port', env.PORT);
        this.app.use(morgan('dev'));
        this.app.use(cors({
            origin: 'http://localhost:3000', // URL del frontend
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        
        // Servir archivos estáticos desde la carpeta public
        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    // Rutas
    private routes(): void {
        // Rutas de autenticación
        this.app.use('/auth', authRoutes);
        
        // Rutas de usuario
        this.app.use('/users', userRoutes);

        // Rutas de membresía
        this.app.use('/memberships', membershipRoutes);

        // Rutas de contrato
        this.app.use('/contracts', contractRoutes);

        // Rutas de cliente
        this.app.use('/clients', clientRoutes);

        // Rutas de entrenamiento
        this.app.use('/schedules', scheduleRoutes);

        // Ruta de prueba
        this.app.get('/', (req: Request, res: Response) => {
            res.status(200).json({
                status: 'success',
                message: 'API funcionando!'
            });
        });

        // Manejo de rutas no encontradas - DEBE IR AL FINAL
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.status(404).json({
                status: 'error',
                message: 'Ruta no encontrada'
            });
        });

        // Middleware de manejo de errores
        this.app.use(errorHandler);
    }

    constructor() {
        this.app = express();
        this.setupConfig();
        this.routes();
    }
}

export default new App().app;