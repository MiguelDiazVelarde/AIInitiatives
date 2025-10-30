# Quick Notes

## _For Execution_

### Development (recommended for coding):
```bash
npm run dev                       # Start both frontend and backend in development mode
```
- **Frontend**: http://localhost:5173 (React with hot reload)
- **Backend**: http://localhost:3000 (Express API)

### Production:
```bash
npm run build                     # Build the application first
npm start                         # Run in production mode
```
- **Application**: http://localhost:3000 (Serves both frontend and API)

### Build only:
```bash
npm run build                     # Compile TypeScript and build React
npm run build:server              # Build backend only
npm run build:client              # Build frontend only
```

### Clean build artifacts:
```bash
npm run clean                     # Remove dist/ and client/dist/ folders
```

### **Default Credentials:**
- **Username**: `admin`
- **Password**: `password`

## _For Testing_

### Quick Tests:
```bash
npm run test                      # Run all Cucumber tests
npm run test:smoke                # Quick authentication tests
npm run test:smoke:ci             # Simple health check for CI
```

### Specific Test Suites:
```bash
npm run test:auth                 # Authentication tests only
npm run test:products             # Product management tests only
npm run test:navigation           # UI navigation tests only
```

### Advanced Testing:
```bash
npm run test:full                 # Run tests with HTML report generation
npm run test:headed               # Run tests in visible browser (non-headless)
npm run test:smoke:full           # Complete smoke test suite with server startup
```

### Test Reports:
```bash
npm run test:report               # Generate HTML report from existing results
```
- **Report location**: `reports/cucumber_report.html`
- **JSON results**: `reports/cucumber_report.json`

### Prerequisites for Testing:
1. **For full tests**: Application must be running (`npm start` or `npm run dev`)
2. **For CI tests**: Only build required (`npm run build`)
3. **Browsers**: Tests require Playwright browsers (auto-installed)

## _Development Workflow_

### Initial Setup:
```bash
npm install                       # Install all dependencies
cd client && npm install         # Install frontend dependencies
cd .. && npm run build           # Build the application
```

### Daily Development:
```bash
npm run dev                       # Start development servers
# Make your changes in VS Code
npm run build                     # Test production build
npm run test:smoke               # Quick test before commit
```

### Before Committing:
```bash
npm run build                     # Ensure code compiles
npm audit --audit-level high     # Check for security issues
npm run test:smoke               # Run basic tests
```

### Troubleshooting:
```bash
npm run clean                     # Clean build artifacts
rm -rf node_modules && npm install # Reinstall dependencies
npm run build                     # Rebuild everything
```

### Port Management (Windows):
```bash
netstat -ano | findstr :3000     # Check what's using port 3000
taskkill /F /PID <PID>           # Kill process using the port
```

### Useful VS Code Extensions:
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Thunder Client** (for API testing)

## _For create a new pull request for changes_

### Create and switch to new branch:
```bash
git checkout -b '<branch-name>'
```
Examples:
```bash
git checkout -b 'feature/add-user-validation'
git checkout -b 'fix/login-error-handling'
git checkout -b 'docs/update-readme'
```

### Alternative: Create branch first, then switch:
```bash
git branch '<branch-name>'        # Create branch
git checkout '<branch-name>'      # Switch to branch
```
Examples:
```bash
git branch 'feature/product-search'
git checkout 'feature/product-search'
```

### Modern alternative (Git 2.23+):
```bash
git switch -c '<branch-name>'     # Create and switch
git switch '<branch-name>'        # Switch to existing branch
```

### Make changes in Visual Studio Code:
```
modified:   client/src/components/LoginForm.tsx
modified:   src/server/routes/auth.ts
modified:   README.md
modified:   package.json
```

### Add files to staging:
```bash
git add '<specific-file>'         # Add single file
git add .                         # Add all changed files
git add src/                      # Add all files in directory
```
Examples:
```bash
git add 'client/src/components/LoginForm.tsx'
git add 'src/server/routes/auth.ts'
git add .
```

### Commit changes:
```bash
git commit -m "<commit-message>"
```
Examples:
```bash
git commit -m "feat: add user input validation to login form"
git commit -m "fix: resolve authentication error handling"
git commit -m "docs: update installation instructions"
```

### Edit last commit (if needed):
```bash
git commit --amend -m "<new-commit-message>"
```
Example:
```bash
git commit --amend -m "feat: add comprehensive user validation to login form"
```

### Push branch to remote repository:
```bash
git push origin <branch-name>
```
Examples:
```bash
git push origin feature/add-user-validation
git push origin fix/login-error-handling
git push origin docs/update-readme
```

### Pull latest changes from remote branch:
```bash
git pull origin <branch-name>
```
Examples:
```bash
git pull origin main
git pull origin feature/add-user-validation
```

### Useful branch management commands:
```bash
git branch                        # List local branches
git branch -r                     # List remote branches  
git branch -a                     # List all branches
git branch -d <branch-name>       # Delete local branch
git push origin --delete <branch> # Delete remote branch
```