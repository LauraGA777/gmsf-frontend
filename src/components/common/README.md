# Common Components

This directory contains shared components that are used across multiple features of the application. These components are not specific to any single feature and provide general functionality.

## Guidelines

- Components in this directory should be truly reusable across features
- They should not contain feature-specific business logic
- They should accept props for customization rather than accessing global state directly
- Documentation should be provided for complex components

## Examples of Common Components

- Layout components (headers, footers, etc.)
- Error boundaries
- Loading indicators
- Generic modals and dialogs
- Pagination components