# API Test Pages

This folder contains development testing components for BoostPay FastAPI integration.

## Structure

```
src/test-pages/
├── ApiTestsNavigation.tsx    # Main navigation page for all API tests
├── ProductsApiTest.tsx       # Products API testing component
├── index.ts                  # Export index for easy imports
└── README.md                 # This file
```

## Usage

### Accessing API Tests

1. **Main Navigation**: Visit `/dev/api-tests` to see all available API tests
2. **Direct Access**: Each test has a direct URL (e.g., `/dev/api-tests/products`)

### Available Tests

- ✅ **Products API** (`/dev/api-tests/products`) - Ready for testing
- 🔄 **Customers API** - Planned
- 🔄 **Transactions API** - Planned  
- 🔄 **Establishments API** - Planned
- 🔄 **Documents API** - Planned
- 🔄 **Authentication API** - Planned

### Features

- **Real-time API Testing**: Test actual API endpoints with your JWT token
- **Global Establishment Management**: Automatically uses establishment from your token
- **Error Handling**: See detailed error messages and validation feedback
- **React Query Integration**: Proper caching, loading states, and optimistic updates
- **Responsive Design**: Works on desktop and mobile devices

### Security

- **Hidden Routes**: Not accessible from main navigation
- **Development Only**: Should be removed or secured in production
- **JWT Required**: All tests require valid authentication

## Adding New Tests

To add a new API test page:

1. Create new component in this folder (e.g., `CustomersApiTest.tsx`)
2. Add export to `index.ts`
3. Add route to `App.tsx`
4. Update the `apiTests` array in `ApiTestsNavigation.tsx`

### Example Component Structure

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
// ... other imports

export const YourApiTest: React.FC = () => {
  // Use hooks from src/hooks/
  // Follow the same pattern as ProductsApiTest.tsx
  
  return (
    <div className="container mx-auto p-6">
      {/* Back button */}
      <Link to="/dev/api-tests">
        <Button variant="outline">Back</Button>
      </Link>
      
      {/* Your test content */}
    </div>
  );
};
```

## Development Notes

- All test pages should include a back button to the main navigation
- Use the global establishment management hooks when possible
- Follow the existing UI patterns for consistency
- Add proper loading states and error handling
- Include examples and documentation in the UI