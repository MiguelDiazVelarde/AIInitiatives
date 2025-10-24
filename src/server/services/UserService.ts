import { User, CreateUserRequest } from '../models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Simulamos una base de datos en memoria
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    createdAt: new Date()
  }
];

export class UserService {
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const existingUser = users.find(u => u.username === userData.username || u.email === userData.email);
    if (existingUser) {
      throw new Error('Usuario o email ya existe');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const newUser: User = {
      id: uuidv4(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);
    return newUser;
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = users.find(u => u.username === username);
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword ? user : null;
  }

  static getUserById(id: string): User | undefined {
    return users.find(u => u.id === id);
  }

  static getAllUsers(): Omit<User, 'password'>[] {
    return users.map(({ password, ...user }) => user);
  }

  static findByUsername(username: string): User | undefined {
    return users.find(u => u.username === username);
  }
}