# 🖥️ Express Server Debug Guide

Complete debugging guide for the Express.js backend server in the iainitiatives project.

This guide provides comprehensive debugging instructions for the Node.js/Express.js server that handles authentication, product management, API routes, and business logic.

## 🔧 Quick Setup

### 1. VS Code Debug Configuration

The project includes pre-configured debug setups in `.vscode/launch.json`:

- **🖥️ Debug Express Server - Development** - General server debugging
- **🔐 Debug Express Server - Authentication Routes** - Authentication-specific debugging
- **📦 Debug Express Server - Product Routes** - Product management debugging
- **🔄 Debug Full Stack - Server + Client** - Combined frontend/backend debugging

### 2. Available Debug Scripts

```bash
# Server debug scripts
npm run server:debug              # General server debug with breakpoints
npm run server:debug:auth         # Authentication routes debug
npm run server:debug:products     # Product routes debug  
npm run server:debug:api          # API endpoints debug

# Full stack debug
npm run fullstack:debug           # Server + Client together
```

## 🎯 Debug Methods

### A. VS Code Debug (Recommended)

1. **Open VS Code**
2. **Go to "Run and Debug" (Ctrl+Shift+D)**
3. **Select server configuration**
4. **Press F5 or click "Start Debugging"**

**Key Features:**
- ✅ Interactive breakpoints in routes and middleware
- ✅ Request/response inspection
- ✅ Database query monitoring
- ✅ Session state debugging
- ✅ Express middleware stack visualization

### B. Terminal Debug

#### Basic Server Debug Commands
```bash
# Debug server with breakpoints
npm run server:debug

# Debug with authentication focus
npm run server:debug:auth

# Debug with verbose logging
npx nodemon --inspect src/server/index.ts

# Debug specific port
node --inspect-brk=0.0.0.0:9229 -r ts-node/register src/server/index.ts
```

#### Advanced Server Debug Commands
```bash
# Debug authentication routes only
cross-env DEBUG=server:auth:* nodemon --inspect src/server/index.ts

# Debug product management
cross-env DEBUG=server:products:* nodemon --inspect src/server/index.ts

# Debug all API endpoints
cross-env DEBUG=server:api:* nodemon --inspect src/server/index.ts

# Debug with specific environment
cross-env NODE_ENV=development PORT=3000 npm run server:debug
```

### C. Chrome DevTools Debug

1. **Run server with --inspect:**
   ```bash
   node --inspect -r ts-node/register src/server/index.ts
   ```

2. **Open Chrome browser**
3. **Navigate to `chrome://inspect`**
4. **Click "Open dedicated DevTools for Node"**

## 🔍 Strategic Debug Points

### 1. Server Entry Point (`src/server/index.ts`)
- **Line ~15**: Express app configuration
- **Line ~25**: Middleware setup (sessions, CORS, body parsing)
- **Line ~35**: Route registration
- **Line ~45**: Server startup and port binding

### 2. Authentication System (`src/server/routes/auth.ts`)
- **POST /api/auth/login**: User authentication logic
- **POST /api/auth/register**: User registration with validation
- **POST /api/auth/logout**: Session cleanup
- **GET /api/auth/me**: Authentication status check
- **Session middleware**: Session management and persistence

### 3. Product Management (`src/server/routes/products.ts`)
- **GET /api/products**: Product listing with filtering
- **POST /api/products**: Product creation with validation
- **DELETE /api/products/:id**: Product deletion with authorization
- **Data validation**: Input sanitization and business rules

### 4. Middleware & Services (`src/server/middleware/` & `src/server/services/`)
- **Authentication middleware**: Request authorization
- **UserService**: User management operations
- **ProductService**: Product business logic
- **Error handling**: Global error management

### 5. Database & Session Management
- **In-memory data store**: User and product data
- **Session store**: Authentication state persistence
- **Data validation**: Input validation and sanitization

## 🛠️ Debug Scenarios

### Scenario 1: Authentication Issues Debug

**Problem**: Login/registration not working properly

**Solution**:
```bash
# 1. Start auth-focused debug
npm run server:debug:auth

# 2. Set breakpoints in auth routes
# 3. Test with curl or Postman
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'
```

**Key Debug Points**:
- User credential validation
- Password hashing verification
- Session creation and storage
- Response cookie setting

### Scenario 2: API Endpoint Debug

**Problem**: API endpoints returning unexpected responses

**Solution**:
```bash
# Debug all API endpoints
npm run server:debug:api

# Test specific endpoints
curl -X GET http://localhost:3000/api/products
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "price": 100}'
```

**Key Debug Points**:
- Request parameter parsing
- Data validation logic
- Business rule enforcement
- Response formatting

### Scenario 3: Session Management Debug

**Problem**: User sessions not persisting correctly

**Solution**:
```bash
# Debug with session focus
cross-env DEBUG=express-session npm run server:debug
```

**Key Debug Points**:
- Session middleware configuration
- Cookie settings and expiration
- Session store operations
- Cross-request session persistence

### Scenario 4: CORS and Middleware Debug

**Problem**: Client cannot connect to server (CORS issues)

**Solution**:
```bash
# Debug with middleware logging
cross-env DEBUG=express:* npm run server:debug
```

**Key Debug Points**:
- CORS configuration
- Request origin validation
- Middleware execution order
- Header processing

## 📊 Debug Output Examples

### Console Debug Output
```bash
🔍 DEBUG: Server starting on port 3000
🔍 DEBUG: MongoDB connection established
🔍 DEBUG: Authentication middleware initialized
🔍 DEBUG: CORS enabled for origins: http://localhost:5173
🔍 DEBUG: Session store configured with memory store
```

### Authentication Debug
```bash
🔐 DEBUG: Login attempt for user: admin
🔐 DEBUG: Password hash verification: success
🔐 DEBUG: Session created with ID: sess_abc123
🔐 DEBUG: Cookie set with expiration: 1h
```

### API Request Debug
```bash
📦 DEBUG: GET /api/products - Query params: {}
📦 DEBUG: Products retrieved: 5 items
📦 DEBUG: Response sent: 200 OK
📦 DEBUG: Response time: 45ms
```

## 🚨 Common Debug Issues

### Issue 1: Port Already in Use
**Solution**:
```bash
# Kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
cross-env PORT=3001 npm run server:debug
```

### Issue 2: TypeScript Compilation Errors
**Solution**:
```bash
# Check server TypeScript compilation
npm run build:server

# Fix compilation errors
npx tsc --noEmit --project tsconfig.server.json
```

### Issue 3: Session Store Issues
**Solution**:
```bash
# Debug session configuration
cross-env DEBUG=express-session,connect:* npm run server:debug
```

### Issue 4: Authentication Middleware Not Working
**Solution**:
```bash
# Debug middleware execution
cross-env DEBUG=server:middleware:* npm run server:debug
```

## 🔧 Development Debug Setup

### 1. Hot Reload with Debug
```bash
# Development with auto-restart and debug
npx nodemon --inspect --exec "ts-node src/server/index.ts"
```

### 2. Environment-specific Debug
```bash
# Debug with production-like settings
cross-env NODE_ENV=production npm run server:debug

# Debug with custom database
cross-env DB_URL="mongodb://localhost:27017/debug" npm run server:debug
```

### 3. Isolated Component Testing
```typescript
// Debug individual services
import { UserService } from './services/UserService';
const userService = new UserService();
const user = await userService.authenticate('admin', 'password');
console.log('Auth result:', user);
```

## 🎮 Server Debug Commands Quick Reference

### Basic Commands
```bash
# Server management
npm run build:server             # Build server TypeScript
npm run start                    # Start production server
npm run dev:server               # Start development server

# Debug commands
npm run server:debug             # General server debug
npm run server:debug:auth        # Authentication debug
npm run server:debug:products    # Product management debug
npm run server:debug:api         # API endpoints debug
```

### Testing Commands
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Test products API
curl -X GET http://localhost:3000/api/products

# Test with session
curl -X GET http://localhost:3000/api/auth/me \
  -H "Cookie: connect.sid=your-session-cookie"
```

### Debug Environment Variables
```bash
# Available debug namespaces
DEBUG=server:*                   # All server logs
DEBUG=server:auth:*              # Authentication logs
DEBUG=server:products:*          # Product management logs
DEBUG=server:api:*               # API endpoint logs
DEBUG=express:*                  # Express framework logs
DEBUG=express-session            # Session management logs
```

## 📈 Performance Debug Tips

### 1. Request Time Monitoring
```typescript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

### 2. Memory Usage Monitoring
```bash
# Monitor memory during debug
node --inspect --max-old-space-size=4096 -r ts-node/register src/server/index.ts
```

### 3. Database Query Debugging
```typescript
// Add query timing
console.time('database-query');
const result = await UserService.findUser(username);
console.timeEnd('database-query');
```

## 🔧 Server Architecture Debug

### 1. Middleware Stack Debugging
```typescript
// Debug middleware execution order
app.use((req, res, next) => {
  console.log(`Middleware: ${req.method} ${req.path}`);
  next();
});
```

### 2. Route Handler Debugging
```typescript
// Debug route resolution
app.use((req, res, next) => {
  console.log(`Route matched: ${req.route?.path || 'No route'}`);
  next();
});
```

### 3. Error Handling Debug
```typescript
// Debug error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  console.error('Request:', req.method, req.path);
  console.error('Body:', req.body);
  next(err);
});
```

## 🆘 Getting Help

If you encounter issues with server debugging:

1. **Check server logs** for error messages
2. **Verify TypeScript compilation** with `npm run build:server`
3. **Check port availability** and environment variables
4. **Review middleware configuration** and execution order
5. **Test API endpoints** with curl or Postman
6. **Monitor database connections** and query execution

---

**Happy Server Debugging! 🖥️→✅**

This debug guide provides comprehensive coverage for troubleshooting and understanding the Express.js server system.