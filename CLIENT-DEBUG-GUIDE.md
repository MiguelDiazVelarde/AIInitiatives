# ⚡ React Client Debug Guide

Complete debugging guide for the React frontend client in the iainitiatives project.

This guide provides comprehensive debugging instructions for the React/TypeScript frontend that handles user interface, authentication state, product management, and API communication.

## 🔧 Quick Setup

### 1. VS Code Debug Configuration

The project includes pre-configured debug setups in `.vscode/launch.json`:

- **⚡ Debug React Client - Development Server** - Vite dev server debugging
- **🏗️ Debug React Client - Build Process** - Build process debugging
- **🔄 Debug Full Stack - Server + Client** - Combined frontend/backend debugging

### 2. Available Debug Scripts

```bash
# Client debug scripts
npm run client:debug              # Development server with debug logs
npm run client:debug:build        # Build process debug
npm run client:debug:preview      # Preview production build

# Full stack debug
npm run fullstack:debug           # Server + Client together
```

## 🎯 Debug Methods

### A. VS Code Debug (Recommended)

1. **Open VS Code**
2. **Go to "Run and Debug" (Ctrl+Shift+D)**
3. **Select client configuration**
4. **Press F5 or click "Start Debugging"**

**Key Features:**
- ✅ React component state debugging
- ✅ API call inspection
- ✅ Authentication state monitoring
- ✅ Router navigation debugging
- ✅ Context and hook state visualization

### B. Browser Developer Tools

#### Chrome DevTools React Debugging
```bash
# 1. Start development server
npm run dev:client

# 2. Open http://localhost:5173 in Chrome
# 3. Open DevTools (F12)
# 4. Install React Developer Tools extension
# 5. Use Components and Profiler tabs
```

#### Advanced Browser Debug
```bash
# Enable React DevTools
# Install React Developer Tools Chrome Extension

# Access React DevTools:
# - Components tab: Component tree and props
# - Profiler tab: Performance analysis
# - Console: Error messages and logs
```

### C. Terminal Debug

#### Basic Client Debug Commands
```bash
# Debug development server
npm run client:debug

# Debug with verbose Vite logs
npm run dev:client -- --debug

# Debug build process
npm run client:debug:build

# Debug with custom port
npm run dev:client -- --port 5174
```

#### Advanced Client Debug Commands
```bash
# Debug with specific environment
cross-env NODE_ENV=development VITE_DEBUG=true npm run dev:client

# Debug API connections
cross-env VITE_API_URL=http://localhost:3000 npm run dev:client

# Debug build with source maps
npm run build:client -- --sourcemap

# Debug preview of production build
npm run client:debug:preview
```

## 🔍 Strategic Debug Points

### 1. Application Entry Point (`client/src/main.tsx`)
- **Line ~8**: React app mounting
- **Line ~10**: Root element selection
- **Line ~12**: Strict mode configuration
- **Global error boundaries**: Unhandled error catching

### 2. App Component (`client/src/App.tsx`)
- **Router configuration**: Route definitions and navigation
- **Authentication context**: User state management
- **Global state management**: Application-wide state
- **Error boundaries**: Component error handling

### 3. Authentication System (`client/src/context/AuthContext.tsx`)
- **Login state management**: User authentication status
- **API integration**: Authentication API calls
- **Token management**: Session token handling
- **State persistence**: Local storage and session management

### 4. API Integration (`client/src/services/api.ts`)
- **HTTP client configuration**: Axios/Fetch setup
- **Request interceptors**: Authentication headers
- **Response handling**: Error and success responses
- **Base URL configuration**: API endpoint management

### 5. Component State & Props
- **Form components**: Login, Register, Product forms
- **List components**: Product listing and management
- **Navigation components**: Header, sidebar, routing
- **State hooks**: useState, useEffect, useContext usage

## 🛠️ Debug Scenarios

### Scenario 1: Authentication State Issues

**Problem**: Login state not persisting or updating correctly

**Solution**:
```bash
# 1. Start client with debug logging
npm run client:debug

# 2. Open browser DevTools
# 3. Check Components tab in React DevTools
# 4. Monitor AuthContext state changes
```

**Key Debug Points**:
- AuthContext provider state
- Login/logout API calls
- Token storage in localStorage
- Context re-renders and updates

### Scenario 2: API Communication Debug

**Problem**: API calls failing or returning unexpected data

**Solution**:
```bash
# Debug with API logging
cross-env VITE_DEBUG_API=true npm run dev:client
```

**Key Debug Points**:
- Network tab in DevTools
- API request/response headers
- CORS configuration
- Error response handling

### Scenario 3: Component Re-rendering Issues

**Problem**: Components re-rendering too often or not updating

**Solution**:
```bash
# Use React Profiler
# 1. Open React DevTools
# 2. Go to Profiler tab
# 3. Start recording
# 4. Interact with components
# 5. Stop and analyze renders
```

**Key Debug Points**:
- Component render frequency
- Props and state changes
- Unnecessary re-renders
- Performance bottlenecks

### Scenario 4: Routing and Navigation Debug

**Problem**: Route navigation not working correctly

**Solution**:
```bash
# Debug router configuration
cross-env VITE_DEBUG_ROUTER=true npm run dev:client
```

**Key Debug Points**:
- Router configuration
- Route parameter parsing
- Navigation guards
- History management

## 📊 Debug Output Examples

### Console Debug Output
```bash
🔍 DEBUG: Vite dev server starting on port 5173
🔍 DEBUG: API base URL: http://localhost:3000
🔍 DEBUG: Authentication context initialized
🔍 DEBUG: Router configured with 5 routes
```

### Authentication Debug
```typescript
🔐 DEBUG: Login attempt initiated
🔐 DEBUG: API call: POST /api/auth/login
🔐 DEBUG: Response received: 200 OK
🔐 DEBUG: User state updated: { id: 1, username: 'admin' }
🔐 DEBUG: Token saved to localStorage
```

### Component Debug
```typescript
⚡ DEBUG: ProductList component mounted
⚡ DEBUG: Fetching products from API
⚡ DEBUG: Products loaded: 5 items
⚡ DEBUG: Component re-rendered: props changed
```

## 🚨 Common Debug Issues

### Issue 1: Vite Dev Server Not Starting
**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart with clean cache
npm run dev:client -- --force
```

### Issue 2: Hot Module Replacement Not Working
**Solution**:
```bash
# Check Vite configuration
# Ensure file watching is enabled
npm run dev:client -- --host
```

### Issue 3: API Calls Failing (CORS)
**Solution**:
```bash
# Check Vite proxy configuration in vite.config.ts
# Ensure server is running on correct port
# Verify CORS headers in server
```

### Issue 4: TypeScript Compilation Errors
**Solution**:
```bash
# Check TypeScript compilation
npx tsc --noEmit --project client/tsconfig.json

# Fix type errors before debugging
```

## 🔧 Development Debug Setup

### 1. Hot Reload with Debug
```bash
# Development with enhanced logging
cross-env VITE_DEBUG=true npm run dev:client
```

### 2. Environment-specific Debug
```bash
# Debug with production build
npm run build:client && npm run preview

# Debug with custom API endpoint
cross-env VITE_API_URL=http://localhost:3001 npm run dev:client
```

### 3. Component Isolation Testing
```typescript
// Debug individual components
import { render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

// Test component in isolation
const component = render(<LoginForm />);
console.log('Component rendered:', component.container.innerHTML);
```

## 🎮 Client Debug Commands Quick Reference

### Basic Commands
```bash
# Client management
npm run build:client            # Build client for production
npm run dev:client              # Start development server
npm run preview                 # Preview production build

# Debug commands
npm run client:debug            # Development with debug logs
npm run client:debug:build      # Build process debug
npm run client:debug:preview    # Preview with debug logs
```

### Vite-specific Commands
```bash
# Vite development options
npm run dev:client -- --port 5174      # Custom port
npm run dev:client -- --host           # Network access
npm run dev:client -- --debug          # Verbose Vite logs
npm run dev:client -- --force          # Clear cache and restart
```

### Environment Variables
```bash
# Available debug variables
VITE_DEBUG=true                 # Enable client debug logs
VITE_DEBUG_API=true            # Enable API debug logs
VITE_DEBUG_ROUTER=true         # Enable router debug logs
VITE_API_URL=http://localhost:3000  # Custom API URL
```

## 📈 Performance Debug Tips

### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run build:client -- --analyze

# Check bundle composition
npx vite-bundle-analyzer dist
```

### 2. React Performance Profiling
```typescript
// Add performance marks
performance.mark('component-start');
// Component logic
performance.mark('component-end');
performance.measure('component-time', 'component-start', 'component-end');
```

### 3. Network Performance
```bash
# Monitor network requests in DevTools
# Check API response times
# Analyze resource loading
```

## 🔧 React Architecture Debug

### 1. Context Debug
```typescript
// Debug context values
const AuthContextDebug = () => {
  const authState = useContext(AuthContext);
  console.log('Auth State:', authState);
  return null;
};
```

### 2. Hook Debug
```typescript
// Debug custom hooks
const useDebugHook = (value, name) => {
  useEffect(() => {
    console.log(`${name} changed:`, value);
  }, [value, name]);
};
```

### 3. Component Props Debug
```typescript
// Debug component props
const DebugProps = ({ children, ...props }) => {
  console.log('Component props:', props);
  return children;
};
```

## 🎨 UI Debug Techniques

### 1. CSS Debug
```css
/* Add debug borders */
* {
  outline: 1px solid red;
}

/* Debug specific components */
.debug {
  border: 2px solid lime;
  background: rgba(0, 255, 0, 0.1);
}
```

### 2. React DevTools Techniques
```bash
# Component highlighting
# Profiler flame graphs
# Component source maps
# Props and state inspection
```

### 3. Browser Debug Features
```bash
# Elements tab: DOM inspection
# Console tab: Error messages and logs
# Network tab: API calls and resources
# Application tab: LocalStorage and session data
```

## 🆘 Getting Help

If you encounter issues with client debugging:

1. **Check browser console** for error messages
2. **Verify Vite configuration** and dev server startup
3. **Test API connectivity** and CORS settings
4. **Review TypeScript compilation** errors
5. **Use React DevTools** for component inspection
6. **Monitor network requests** in DevTools

---

**Happy Client Debugging! ⚡→✅**

This debug guide provides comprehensive coverage for troubleshooting and understanding the React frontend system.