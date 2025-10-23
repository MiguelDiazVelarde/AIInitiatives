# Products App - Aplicación Simple con Login y Gestión de Productos

Una aplicación web simple desarrollada con **TypeScript**, **Express.js** y **Node.js** que incluye sistema de autenticación y gestión de productos.

## 🚀 Características

- ✅ **Sistema de Login/Registro** - Autenticación segura con sesiones
- ✅ **Gestión de Productos** - CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ **Formularios Interactivos** - Interfaz web responsive
- ✅ **TypeScript** - Tipado estático para mayor robustez
- ✅ **Seguridad** - Contraseñas encriptadas con bcrypt
- ✅ **Sesiones** - Manejo de estado de usuario

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js + Express.js + TypeScript
- **Autenticación**: express-session + bcryptjs
- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Base de Datos**: En memoria (para simplicidad)

## 📋 Prerrequisitos

- Node.js (v14 o superior)
- npm o yarn

## 🔧 Instalación y Configuración

1. **Clonar el repositorio**:
```bash
git clone https://github.com/MiguelDiazVelarde/iainitiatives.git
cd iainitiatives
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Compilar TypeScript**:
```bash
npm run build
```

4. **Iniciar la aplicación**:
```bash
npm start
```

5. **Abrir en el navegador**:
   - Ir a: http://localhost:3000

## 🎯 Uso de la Aplicación

### Inicio de Sesión
- **Usuario de prueba**: `admin`
- **Contraseña**: `password`

O puedes registrar un nuevo usuario.

### Funcionalidades Disponibles

1. **Autenticación**:
   - Registro de nuevos usuarios
   - Inicio de sesión
   - Cierre de sesión

2. **Gestión de Productos**:
   - Agregar productos con formulario
   - Ver lista de productos
   - Eliminar productos
   - Campos: nombre, descripción, precio, categoría, stock

## 📁 Estructura del Proyecto

```
src/
├── index.ts              # Servidor principal
├── models/               # Interfaces TypeScript
│   ├── User.ts
│   └── Product.ts
├── services/             # Lógica de negocio
│   ├── UserService.ts
│   └── ProductService.ts
├── routes/               # Rutas HTTP
│   ├── auth.ts
│   └── products.ts
└── middleware/           # Middleware personalizado
    └── auth.ts
```

## 🚀 Scripts Disponibles

```bash
npm run build    # Compilar TypeScript
npm start        # Ejecutar en producción
npm run dev      # Ejecutar en desarrollo (con nodemon)
npm run clean    # Limpiar archivos compilados
```

## 🔐 Características de Seguridad

- Contraseñas encriptadas con bcrypt
- Sesiones seguras con express-session
- Validación de entrada en formularios
- Middleware de autenticación

## 🌟 Próximas Mejoras

- [ ] Base de datos persistente (MongoDB/PostgreSQL)
- [ ] JWT para autenticación
- [ ] API REST completa
- [ ] Frontend con React/Vue
- [ ] Subida de imágenes
- [ ] Búsqueda y filtros
- [ ] Roles de usuario

## 📝 API Endpoints

### Autenticación
- `GET /auth/login` - Página de login
- `POST /auth/login` - Procesar login
- `GET /auth/register` - Página de registro
- `POST /auth/register` - Procesar registro
- `POST /auth/logout` - Cerrar sesión

### Productos
- `GET /dashboard` - Dashboard principal
- `POST /products` - Crear producto
- `GET /api/products` - Obtener todos los productos (JSON)
- `GET /api/products/:id` - Obtener producto por ID (JSON)
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Miguel Diaz Velarde**
- GitHub: [@MiguelDiazVelarde](https://github.com/MiguelDiazVelarde)

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!