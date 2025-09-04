# Coding Standards and Best Practices

## Table of Contents

1. [TypeScript Guidelines](#typescript-guidelines)
2. [Code Organization](#code-organization)
3. [Naming Conventions](#naming-conventions)
4. [Error Handling](#error-handling)
5. [Testing Standards](#testing-standards)
6. [Documentation](#documentation)
7. [Security](#security)

## TypeScript Guidelines

### Strict Type Checking

All code must pass strict TypeScript checking with the following rules enforced:

- **No `any` types**: All variables and functions must have explicit types
- **No unused code**: Remove all unused variables, imports, and parameters
- **No implicit returns**: All code paths must have explicit returns
- **Null safety**: Handle all nullable values explicitly

```typescript
// ❌ Bad
function processData(data: any) {
  console.log(data);
}

// ✅ Good
interface Data {
  id: string;
  value: number;
}

function processData(data: Data): void {
  // Process data explicitly
}
```

### Type Exports

- Export types and interfaces from index files
- Use type-only imports when importing types
- Prefer interfaces over type aliases for object shapes

```typescript
// ✅ Good
export type { User, UserRole } from './types';
import type { User } from '@/types';
```

## Code Organization

### File Structure

```
src/
├── components/      # React components
│   ├── atoms/      # Basic building blocks
│   ├── molecules/  # Composed components
│   └── organisms/  # Complex components
├── features/       # Feature-based modules
├── hooks/          # Custom React hooks
├── services/       # API and external services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── constants/      # Application constants
```

### Module Guidelines

- One component per file
- Group related functionality in features
- Keep files under 500 lines
- Functions under 100 lines
- Maximum nesting depth of 4

## Naming Conventions

### Files and Folders

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE files (e.g., `API_ENDPOINTS.ts`)
- **Hooks**: camelCase starting with 'use' (e.g., `useAuth.ts`)

### Variables and Functions

```typescript
// Constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Variables
const userProfile = getUserProfile();
const isLoading = false;

// Functions
function calculateTotal(items: Item[]): number {
  // ...
}

// React Components
function UserProfile({ userId }: Props): JSX.Element {
  // ...
}

// Types/Interfaces
interface UserProfile {
  id: string;
  name: string;
}

type UserRole = 'admin' | 'user' | 'guest';
```

## Error Handling

### Try-Catch Blocks

Always handle errors explicitly and provide meaningful error messages:

```typescript
// ✅ Good
try {
  const result = await fetchData();
  return result;
} catch (error) {
  if (error instanceof NetworkError) {
    logger.error('Network error occurred:', error);
    throw new Error('Failed to fetch data due to network issues');
  }

  logger.error('Unexpected error:', error);
  throw new Error('An unexpected error occurred');
}
```

### Error Boundaries

Use error boundaries in React applications to catch rendering errors:

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Component error:', error, info);
  }
}
```

## Testing Standards

### Test Structure

```typescript
describe('ComponentName', () => {
  describe('when condition is met', () => {
    it('should behave in expected way', () => {
      // Arrange
      const props = { /* ... */ };

      // Act
      const result = render(<Component {...props} />);

      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for critical business logic
- Test all error scenarios
- Include edge cases

## Documentation

### JSDoc Comments

Document all public APIs and complex functions:

```typescript
/**
 * Calculates the total price including tax
 * @param items - Array of items to calculate
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price with tax applied
 * @throws {Error} If items array is empty
 */
export function calculateTotalWithTax(items: Item[], taxRate: number): number {
  if (items.length === 0) {
    throw new Error('Items array cannot be empty');
  }
  // Implementation
}
```

### README Files

Each package should include:

- Purpose and overview
- Installation instructions
- Usage examples
- API documentation
- Contributing guidelines

## Security

### Data Validation

Always validate and sanitize user input:

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
  name: z.string().min(1).max(100),
});

function validateUser(data: unknown): User {
  return userSchema.parse(data);
}
```

### Sensitive Data

- Never log sensitive information
- Use environment variables for secrets
- Implement proper authentication/authorization
- Sanitize data before displaying

```typescript
// ❌ Bad
console.log(`User password: ${password}`);

// ✅ Good
logger.info(`User ${userId} authenticated successfully`);
```

## Commit Standards

Follow conventional commits:

```bash
feat: add user authentication
fix: resolve memory leak in data processor
docs: update API documentation
style: format code according to prettier rules
refactor: simplify user service logic
test: add unit tests for auth module
chore: update dependencies
```

## Pull Request Guidelines

1. Keep PRs focused and small
2. Include tests for new features
3. Update documentation
4. Ensure all checks pass
5. Request review from appropriate team members

## Performance Guidelines

- Use React.memo for expensive components
- Implement virtualization for long lists
- Lazy load routes and components
- Optimize bundle size
- Monitor performance metrics

## Accessibility

- Include proper ARIA labels
- Ensure keyboard navigation
- Maintain color contrast ratios
- Provide alt text for images
- Test with screen readers

---

These standards are enforced through automated tooling including ESLint,
Prettier, TypeScript, and CI/CD pipelines. All code must pass these checks
before merging.
