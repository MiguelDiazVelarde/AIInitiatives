# Products App - Simple Application with Login and Product Management

![CI/CD Pipeline](https://github.com/MiguelDiazVelarde/iainitiatives/workflows/CI/CD%20Pipeline/badge.svg)
![Pull Request Validation](https://github.com/MiguelDiazVelarde/iainitiatives/workflows/Pull%20Request%20Validation/badge.svg)

A simple web application built with **React**, **TypeScript**, **Express.js** and **Node.js** that includes authentication system and product management with automated CI/CD pipeline.

## 🚀 Features

- ✅ **Login/Registration System** - Secure authentication with sessions
- ✅ **Product Management** - Complete CRUD (Create, Read, Update, Delete)
- ✅ **React Frontend** - Modern Single Page Application (SPA)
- ✅ **Interactive Forms** - Responsive web interface with React components
- ✅ **TypeScript** - Static typing for enhanced robustness
- ✅ **Security** - Encrypted passwords with bcrypt
- ✅ **Sessions** - User state management
- ✅ **REST API** - JSON-based backend API
- ✅ **Testing** - Complete functional test suite with Gherkin/Playwright
- ✅ **CI/CD Pipeline** - Automated testing and deployment with GitHub Actions

## 🛠️ Technologies Used

- **Backend**: Node.js + Express.js + TypeScript (REST API)
- **Frontend**: React + TypeScript + Vite
- **Authentication**: express-session + bcryptjs
- **Routing**: React Router
- **State Management**: React Context API
- **Database**: In-memory (for simplicity)
- **Testing**: Cucumber (Gherkin) + Playwright
- **Build Tools**: TypeScript compiler + Vite

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm or yarn

## 🔧 Installation and Setup

1. **Clone the repository**:
```bash
git clone https://github.com/MiguelDiazVelarde/iainitiatives.git
cd iainitiatives
```

2. **Install dependencies**:
```bash
npm install
```

3. **Compile TypeScript**:
```bash
npm run build
```

4. **Start the application**:
```bash
npm start
```

5. **Open in browser**:
   - **React App**: <http://localhost:5173> (Development)
   - **API Server**: <http://localhost:3000> (Backend)

## 🎯 Application Usage

### Login
- **Test user**: `admin`
- **Password**: `password`

Or you can register a new user.

### Available Features

1. **Authentication**:
   - New user registration
   - Login
   - Logout

2. **Product Management**:
   - Add products with form
   - View product list
   - Delete products
   - Fields: name, description, price, category, stock

## 📁 Project Structure

```
client/                   # React Frontend
├── src/
│   ├── components/       # React components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductForm.tsx
│   ├── pages/            # Page components
│   │   └── Dashboard.tsx
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx           # Main App component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
└── package.json          # Frontend dependencies

src/server/               # Express Backend
├── index.ts              # Main server
├── models/               # TypeScript interfaces
│   ├── User.ts
│   └── Product.ts
├── services/             # Business logic
│   ├── UserService.ts
│   └── ProductService.ts
├── routes/               # HTTP routes
│   ├── auth.ts
│   └── products.ts
└── middleware/           # Custom middleware
    └── auth.ts

tests/                    # Test suite
├── features/             # Gherkin feature files
├── step-definitions/     # Test step implementations
└── support/              # Test configuration
```

## 🚀 Available Scripts

### Application

```bash
npm run build    # Compile both frontend and backend
npm start        # Run in production (backend only)
npm run dev      # Run in development (both frontend and backend)
npm run clean    # Clean compiled files
```

### Testing

```bash
npm run test              # Run all tests
npm run test:full         # Run tests with HTML report
npm run test:auth         # Authentication tests only
npm run test:products     # Product tests only
npm run test:navigation   # Navigation tests only
        # Quick smoke tests
npm run test:headed       # Run tests in visible browser
```

## 🔐 Security Features

- Encrypted passwords with bcrypt
- Secure sessions with express-session
- Form input validation
- Authentication middleware

## 🧪 Testing

This project includes a comprehensive test suite with:

- **Gherkin/BDD scenarios** in English
- **Playwright automation** for browser testing
- **Complete coverage** of authentication, products, and navigation
- **HTML reports** with detailed results
- **Cross-browser testing** (Chrome, Firefox, Safari)

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 🔄 CI/CD Pipeline

This project includes a complete CI/CD pipeline using **GitHub Actions** that automatically runs tests and validates code quality on every pull request and commit.

### Automated Workflows

#### 🔍 Pull Request Validation (`pr-validation.yml`)
Triggers on every pull request and validates:
- ✅ PR title and description requirements
- ✅ TypeScript compilation
- ✅ Application startup verification
- ✅ Smoke tests execution
- ✅ Security scan for sensitive information
- ✅ Automatic PR summary generation

#### 🧪 CI/CD Pipeline (`ci.yml`)
Comprehensive testing pipeline that runs on:
- Pull requests to main branch
- Pushes to main branch
- Manual triggers

**Features:**
- **Matrix Testing**: Tests across Node.js 20.x and 22.x
- **Build Verification**: TypeScript compilation and build process
- **Application Testing**: Full smoke test suite with Playwright
- **E2E Testing**: Complete end-to-end tests on PR
- **Security Checks**: Dependency audit and license compliance
- **Test Reports**: Automatic generation of test result comments
- **Artifact Upload**: Test results and reports stored for 7 days

#### 🚀 Release Automation (`release.yml`)
Automated release process triggered by version tags:
- ✅ Full test suite execution
- ✅ Build artifact creation
- ✅ GitHub release generation with notes
- ✅ Asset packaging and upload
- ✅ Staging depnpm run test:smokeloyment preparation

### Setting Up CI/CD

The workflows are automatically configured when you push to GitHub. To get the most out of the CI/CD pipeline:

1. **Branch Protection**: Set up branch protection rules on `main` branch
2. **Required Checks**: Make CI/CD pipeline required before merging
3. **Auto-merge**: Enable auto-merge for PRs that pass all checks

### GitHub Actions Secrets

No secrets are required for the basic pipeline. For advanced features, you may need:
- `GITHUB_TOKEN` (automatically provided)
- Deployment secrets for staging/production (if added)

### Workflow Status

Check the status of workflows in the [Actions tab](../../actions) of your repository.

Current pipeline includes:
- ✅ Automated PR validation
- ✅ Multi-version Node.js testing
- ✅ Security and quality checks
- ✅ Test result reporting
- ✅ Release automation

### Local Testing Before Push

Run these commands locally to ensure your changes will pass CI:

```bash
# TypeScript compilation
npm run build

# Run smoke tests
npm run test:smoke

# Security audit
npm audit --audit-level high
```

## 🌟 Future Improvements

- [ ] Persistent database (MongoDB/PostgreSQL)
- [ ] JWT for authentication
- [ ] Complete REST API
- [x] ~~Frontend with React/Vue~~ ✅ **Completed with React**
- [ ] Image upload
- [ ] Search and filters
- [ ] User roles
- [ ] Docker containerization
- [x] ~~CI/CD pipeline~~ ✅ **Already implemented**

## 📝 API Endpoints

### Authentication

- `POST /api/auth/login` - User login (JSON)
- `POST /api/auth/register` - User registration (JSON)
- `POST /api/auth/logout` - User logout (JSON)
- `GET /api/auth/me` - Check authentication status (JSON)

### Products

- `GET /api/products` - Get all products (JSON)
- `POST /api/products` - Create product (JSON)
- `GET /api/products/:id` - Get product by ID (JSON)
- `DELETE /api/products/:id` - Delete product (JSON)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Miguel Diaz Velarde**
- GitHub: [@MiguelDiazVelarde](https://github.com/MiguelDiazVelarde)

---

⭐ If you like this project, give it a star on GitHub!