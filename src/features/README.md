# Features Directory

This directory contains feature-based modules that organize code according to business domains rather than technical concerns. Each feature folder encapsulates all the necessary components, hooks, and utilities specific to that feature.

## Structure

Each feature folder follows this structure:

```
feature-name/
├── components/     # UI components specific to this feature
├── hooks/          # Custom hooks specific to this feature
├── services/       # API services and data fetching for this feature
├── types/          # TypeScript types specific to this feature
├── utils/          # Utility functions specific to this feature
└── index.ts        # Public API exports for the feature
```

## Benefits

- **Encapsulation**: Each feature contains all its related code
- **Maintainability**: Easier to understand and modify features independently
- **Scalability**: New features can be added without affecting existing ones
- **Reusability**: Features can expose a clear public API through index.ts