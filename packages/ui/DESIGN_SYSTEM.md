# Joby Design System Documentation

## Overview

The Joby Design System provides a comprehensive set of reusable components built with React, TypeScript, and Tailwind CSS. It follows Atomic Design principles for better scalability and maintainability.

## Architecture

### Atomic Design Structure

Our design system follows the Atomic Design methodology:

- **Atoms** (`/src/atoms/`): Basic building blocks - buttons, inputs, badges
- **Molecules** (`/src/molecules/`): Combinations of atoms - form fields, card with actions
- **Organisms** (`/src/organisms/`): Complex components - sidebars, navigation, panels
- **Templates** (`/src/templates/`): Page layouts - dashboard, application templates
- **Features** (`/src/features/`): Feature-specific implementations

## Theme System

### CSS Variables

The design system uses CSS custom properties for theming:

```css
/* Light Theme (default) */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--secondary: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
--muted: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--card: 0 0% 100%;
--popover: 0 0% 100%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;
--radius: 0.5rem;
```

### Dark Mode Support

Apply the `.dark` class to the root element to enable dark mode:

```html
<html class="dark">
  <!-- Dark mode enabled -->
</html>
```

## Design Tokens

Design tokens are available in `/src/theme/tokens.ts`:

### Color Palette

- **Primary**: Blue scale for primary actions
- **Gray**: Neutral colors for text and backgrounds
- **Success**: Green scale for positive states
- **Warning**: Amber scale for caution states
- **Error**: Red scale for error states

### Spacing

Uses rem-based scale: 0.25rem (1), 0.5rem (2), 0.75rem (3), etc.

### Typography

- Font sizes: xs (0.75rem) to 9xl (8rem)
- Font weights: thin (100) to black (900)

### Border Radius

- sm: 0.125rem
- DEFAULT: 0.25rem
- md: 0.375rem
- lg: 0.5rem
- xl: 0.75rem
- full: 9999px

## Component Usage

### Basic Example

```tsx
import { Button, Card, Input } from "@packages/ui";

function MyComponent() {
  return (
    <Card>
      <Input placeholder="Enter text" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### With Theme Provider

```tsx
import { ThemeProvider } from "@packages/ui";

function App() {
  return (
    <ThemeProvider defaultTheme="light">{/* Your app content */}</ThemeProvider>
  );
}
```

## Tailwind Configuration

The design system extends Tailwind CSS with custom configurations:

1. **Dark Mode**: Class-based dark mode support
2. **Custom Colors**: Theme-aware color system using CSS variables
3. **Container**: Centered container with responsive padding
4. **Animations**: Custom keyframes for UI interactions

## Best Practices

### Component Composition

- Use the `cn()` utility for conditional classes
- Extend components using the `className` prop
- Forward refs for DOM access when needed

### Accessibility

- All interactive components support keyboard navigation
- ARIA attributes are included by default
- Focus indicators follow WCAG guidelines

### Performance

- Components are optimized for bundle size
- Tree-shaking enabled via ES modules
- CSS is purged in production builds

## Development

### Adding New Components

1. Determine the atomic level (atom, molecule, organism)
2. Create component in appropriate directory
3. Add Storybook story for documentation
4. Export from index.ts
5. Update this documentation

### Testing

```bash
# Run tests
pnpm test

# Run Storybook
pnpm storybook

# Build library
pnpm build
```

## Migration Guide

### From Legacy Components

Components in `/components` are being migrated to the atomic structure:

- `Button` → `/atoms/button`
- `Card` → `/atoms/card`
- `Sidebar` → `/organisms/sidebar`
- `SplitPanel` → `/organisms/split-panel`

Update imports:

```tsx
// Old
import { Button } from "@packages/ui/components/Button";

// New
import { Button } from "@packages/ui";
```
