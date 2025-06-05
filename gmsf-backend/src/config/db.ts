import { Sequelize } from 'sequelize';
import { env } from './env';
import path from 'path';

const setupSequelize = () => {
    let config;

    if (env.DATABASE_URL) {
        console.log('📡 Using DATABASE_URL for connection');
        return new Sequelize(env.DATABASE_URL, {
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false
                }
            },
            logging: env.NODE_ENV === 'development' ? console.log : false
        });
    }
    
//Configuración manual solo si no hay DATABASE_URL

    const requiredConfig = {
        database: env.DB_NAME,
        username: env.DB_USER,
        password: env.DB_PASSWORD,
        host: env.DB_HOST,
        port: env.DB_PORT,
        ssl: env.DB_SSL
    };

    console.log('🔧 Using individual DB config:', {
        ...requiredConfig,
        password: '***' // Ocultamos la contraseña en logs
    });

    return new Sequelize(
        requiredConfig.database,
        requiredConfig.username,
        requiredConfig.password,
        {
            host: requiredConfig.host,
            port: requiredConfig.port,
            dialect: 'postgres',
            dialectModule: require('pg'),
            dialectOptions: {
                ssl: requiredConfig.ssl ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            },
            logging: env.NODE_ENV === 'development' ? console.log : false
        }
    );
};

const sequelize = setupSequelize(); 

// Función de test de conexión
export const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');
        await sequelize.sync({ alter: env.NODE_ENV === 'development' });
        console.log('🔄 Database synced');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

export default sequelize;

// Agregar verificación de DATABASE_URL
if (!env.DATABASE_URL && !env.DB_HOST) {
    throw new Error('Se requiere DATABASE_URL o DB_HOST en .env');
}