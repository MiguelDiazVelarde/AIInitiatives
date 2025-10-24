# Contributing to Product Management Application

Thank you for considering contributing to this project! This document explains how to work with our CI/CD pipeline and testing infrastructure.

## 🔄 Development Workflow with CI/CD

### 1. Setting Up Your Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/iainitiatives.git
cd iainitiatives

# Install dependencies
npm install

# Build the project
npm run build

# Run tests locally
npm run test:smoke
```

### 2. Creating a Pull Request

Our CI/CD pipeline automatically validates every pull request. Here's what happens:

#### When you open a PR:

1. **Automatic Validation** runs via GitHub Actions
2. **PR Validation Workflow** checks:
   - ✅ PR title (minimum 10 characters)
   - ✅ PR description (minimum 20 characters)
   - ✅ TypeScript compilation
   - ✅ Application startup test
   - ✅ Smoke tests execution
   - ✅ Security scan for sensitive data

3. **Automated PR Summary** is posted with:
   - List of changed files
   - Validation results
   - Next steps for reviewers

#### External Contributors

If you're contributing from a forked repository:
- A maintainer must approve running tests for security
- Comment `/approve-tests` will trigger the full test suite
- This is a security measure to prevent malicious code execution

### 3. CI/CD Pipeline Details

#### 🧪 Main CI Pipeline (`ci.yml`)

**Triggers:**
- Pull requests to `main`
- Pushes to `main`
- Manual workflow dispatch

**Jobs:**
1. **Build and Test** (Node.js 20.x, 22.x)
   - Install dependencies
   - Build TypeScript
   - Start application
   - Run smoke tests
   - Upload test artifacts

2. **E2E Tests** (PR only)
   - Full end-to-end testing
   - Generate test reports
   - Comment results on PR

3. **Security Checks**
   - npm audit for vulnerabilities
   - License compliance check
   - Dependency analysis

#### 🔍 PR Validation (`pr-validation.yml`)

**Quick checks for every PR:**
- Code compilation
- Basic functionality test
- Security pattern scanning
- PR quality validation

### 4. Testing Requirements

Before submitting a PR, ensure all tests pass:

```bash
# Required: Smoke tests must pass
npm run test:smoke

# Optional: Run full test suite
npm run test

# Check for TypeScript errors
npm run build

# Security audit
npm audit --audit-level high
```

### 5. What Our CI/CD Checks

#### ✅ Code Quality
- TypeScript compilation without errors
- No security vulnerabilities in dependencies
- No hardcoded secrets or API keys
- Proper code formatting

#### ✅ Functionality
- Application starts successfully
- All smoke tests pass
- Authentication flow works
- Product management features work

#### ✅ Security
- No sensitive information in code
- Dependencies are secure
- No malicious patterns detected

### 6. Troubleshooting CI/CD Issues

#### Common Failures and Solutions:

**❌ TypeScript Compilation Error**
```bash
# Run locally to see the error
npm run build
# Fix TypeScript errors and commit
```

**❌ Smoke Tests Failing**
```bash
# Run tests locally
npm run test:smoke
# Check application logs and fix issues
```

**❌ Security Audit Failed**
```bash
# Check for vulnerabilities
npm audit
# Update dependencies
npm audit fix
```

**❌ Application Won't Start**
```bash
# Test locally
npm start
# Check logs for startup errors
```

### 7. CI/CD Status Badges

Monitor the health of your contributions:

- ![CI/CD Pipeline](https://github.com/MiguelDiazVelarde/iainitiatives/workflows/CI/CD%20Pipeline/badge.svg)
- ![PR Validation](https://github.com/MiguelDiazVelarde/iainitiatives/workflows/Pull%20Request%20Validation/badge.svg)

### 8. Branch Protection Rules

The `main` branch is protected with:
- ✅ PR required before merging
- ✅ CI/CD checks must pass
- ✅ At least 1 reviewer approval
- ✅ Branch must be up to date

### 9. Release Process

When maintainers create a release:

1. **Create a version tag**: `git tag v1.0.0`
2. **Push tag**: `git push origin v1.0.0`
3. **Automatic release workflow** runs:
   - Full test suite
   - Build artifacts
   - Generate release notes
   - Create GitHub release

### 10. Getting Help

If you have issues with CI/CD:

1. **Check workflow logs** in GitHub Actions tab
2. **Run tests locally** to reproduce issues
3. **Ask for help** in PR comments
4. **Review this guide** for common solutions

### 11. Best Practices

#### Before submitting a PR:
- ✅ Test your changes locally
- ✅ Ensure all tests pass
- ✅ Write meaningful commit messages
- ✅ Update documentation if needed
- ✅ Check for security issues

#### Writing good PRs:
- 📝 Clear, descriptive title
- 📝 Detailed description of changes
- 📝 Reference any related issues
- 📝 Include screenshots for UI changes
- 📝 Test instructions for reviewers

#### Code quality:
- 🔧 Follow TypeScript best practices
- 🔧 Add tests for new features
- 🔧 Keep functions small and focused
- 🔧 Document complex logic
- 🔧 Handle errors gracefully

### 12. CI/CD Architecture

```
GitHub PR/Push
      ↓
PR Validation Workflow
      ↓
├── TypeScript Build
├── Smoke Tests
├── Security Scan
└── PR Summary
      ↓
Main CI/CD Pipeline
      ↓
├── Matrix Testing (Node 20.x, 22.x)
├── Full Test Suite
├── E2E Tests
├── Security Audit
└── Artifact Upload
      ↓
Release Workflow (on tags)
      ↓
├── Full Testing
├── Build Artifacts
├── Generate Release
└── Deploy (future)
```

## 🎯 Contributing Goals

Help us improve:
- 🚀 Application features and performance
- 🧪 Test coverage and quality
- 📚 Documentation and examples
- 🔒 Security and best practices
- 🔄 CI/CD pipeline efficiency

Thank you for contributing! Every PR helps make this project better. 🙏