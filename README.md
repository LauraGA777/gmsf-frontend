# Gym Management System Frontend (GMSF)

Sistema de gestión para gimnasios que permite administrar clientes, membresías, entrenamientos y más.

## Características

- Gestión de clientes y membresías
- Programación de entrenamientos
- Calendario de actividades
- Gestión de contratos
- Panel de administración
- Roles de usuario (Admin, Entrenador, Cliente)
- Diseño responsive

## Tecnologías

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- date-fns
- React Router
- SweetAlert2

## Arquitectura

Este proyecto sigue una arquitectura limpia basada en características con la siguiente estructura:

```
src/
├── assets/            # Recursos estáticos como imágenes, fuentes, etc.
├── components/         # Componentes UI reutilizables
│   ├── common/         # Componentes compartidos entre características
│   └── ui/             # Componentes UI básicos (botones, inputs, etc.)
├── features/           # Módulos basados en características
│   ├── auth/           # Autenticación
│   ├── clients/        # Gestión de clientes
│   ├── contracts/      # Gestión de contratos
│   ├── dashboard/      # Dashboard y analíticas
│   └── services/       # Servicios y programación
├── hooks/              # Hooks personalizados de React
├── layouts/            # Componentes de diseño (AppLayout, etc.)
├── lib/                # Bibliotecas de utilidad y helpers
├── providers/          # Proveedores de contexto
├── routes/             # Configuración de rutas
├── services/           # Servicios API y obtención de datos
├── styles/             # Estilos globales y configuración de temas
├── types/              # Definiciones de tipos TypeScript
└── utils/              # Funciones de utilidad
```

