# Products App - Simple Application with Login and Product Management

A simple web application built with **TypeScript**, **Express.js** and **Node.js** that includes authentication system and product management.

## 🚀 Features

- ✅ **Login/Registration System** - Secure authentication with sessions
- ✅ **Product Management** - Complete CRUD (Create, Read, Update, Delete)
- ✅ **Interactive Forms** - Responsive web interface
- ✅ **TypeScript** - Static typing for enhanced robustness
- ✅ **Security** - Encrypted passwords with bcrypt
- ✅ **Sessions** - User state management
- ✅ **Testing** - Complete functional test suite with Gherkin/Playwright

## 🛠️ Technologies Used

- **Backend**: Node.js + Express.js + TypeScript
- **Authentication**: express-session + bcryptjs
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Database**: In-memory (for simplicity)
- **Testing**: Cucumber (Gherkin) + Playwright
- **Build**: TypeScript compiler

## 📋 Prerequisites

- Node.js (v14 or higher)
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
   - Go to: http://localhost:3000

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
src/
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
├── middleware/           # Custom middleware
│   └── auth.ts
└── tests/                # Test suite
    ├── features/         # Gherkin feature files
    ├── step-definitions/ # Test step implementations
    └── support/          # Test configuration
```

## 🚀 Available Scripts

### Application
```bash
npm run build    # Compile TypeScript
npm start        # Run in production
npm run dev      # Run in development (with nodemon)
npm run clean    # Clean compiled files
```

### Testing
```bash
npm run test              # Run all tests
npm run test:full         # Run tests with HTML report
npm run test:auth         # Authentication tests only
npm run test:products     # Product tests only
npm run test:navigation   # Navigation tests only
npm run test:smoke        # Quick smoke tests
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

## 🌟 Future Improvements

- [ ] Persistent database (MongoDB/PostgreSQL)
- [ ] JWT for authentication
- [ ] Complete REST API
- [ ] Frontend with React/Vue
- [ ] Image upload
- [ ] Search and filters
- [ ] User roles
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 API Endpoints

### Authentication
- `GET /auth/login` - Login page
- `POST /auth/login` - Process login
- `GET /auth/register` - Registration page
- `POST /auth/register` - Process registration
- `POST /auth/logout` - Logout

### Products
- `GET /dashboard` - Main dashboard
- `POST /products` - Create product
- `GET /api/products` - Get all products (JSON)
- `GET /api/products/:id` - Get product by ID (JSON)
- `PUT /api/products/:id` - Update product
- `DELETE /products/:id` - Delete product

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