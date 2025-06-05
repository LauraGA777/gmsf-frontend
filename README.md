# GMSF (Gym Management Software)

Sistema de gestión integral para gimnasios que permite administrar membresías, servicios y productos de manera eficiente.

## 🎯 Descripción

GMSF es una aplicación web diseñada para optimizar la gestión operativa de gimnasios, facilitando el control de membresías, servicios y seguimiento de clientes.

## 💻 Stack Tecnológico

- **Base de datos:** PostgreSQL
- **Backend/API:** Node.js
- **Frontend:** 
  - React + Vite
  - Tailwind CSS
  - shadcn/ui

## 🚀 Objetivos

### General
Desarrollar una aplicación web que gestione eficientemente los procesos de membresías, servicios y productos según las necesidades del cliente.

### Específicos
- Gestión de roles y permisos
- Administración segura de cuentas de usuario
- Control y renovación de membresías
- Gestión de servicios personalizada
- Monitoreo del desempeño mediante métricas

## ✨ Características Principales

1. **Gestión de Configuración**
   - Control de roles y permisos
   - Acceso personalizado a funcionalidades

2. **Gestión de Usuarios**
   - Administración de accesos
   - Recuperación de contraseñas
   - Sistema de roles

3. **Gestión de Membresías**
   - Creación y renovación de planes
   - Actualización de información
   - Seguimiento de estado

4. **Gestión de Servicios**
   - Reserva de clases
   - Asignación de entrenadores
   - Control de asistencia
   - Gestión de horarios

5. **Dashboard de Rendimiento**
   - Informes estadísticos en tiempo real
   - Métricas de desempeño
   - Visualización de datos

## 🛠️ Requisitos Previos

- Node.js v18+
- PostgreSQL 15+
- npm
- React 18

## ⚙️ Variables de Entorno

```env

# Frontend
VITE_API_URL=https://gmsf-api.vercel.app/api

# Puerto del servidor
PORT=

# Configuración de Base de Datos
DB_HOST=
DB_SSL=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

# Configuración Postgres Vercel
POSTGRES_URL=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Configuración JWT
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=

# Configuración de Email
EMAIL_USER=
EMAIL_PASSWORD=
MAILTRAP_USER=
MAILTRAP_PASSWORD=
MAILTRAP_HOST=
MAILTRAP_PORT=```