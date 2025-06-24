import pool from '../utils/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  roles: string[];
  is_verified: boolean;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles?: string[];
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const roles = userData.roles || ['customer'];

    const query = `
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone, roles)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, phone, avatar_url, roles, 
                is_verified, is_active, last_login, created_at, updated_at
    `;

    const values = [
      id, 
      userData.email.toLowerCase(), 
      hashedPassword, 
      userData.first_name, 
      userData.last_name, 
      userData.phone,
      roles
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, phone, avatar_url, roles,
             is_verified, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  static async findByEmailWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    const query = `
      SELECT id, email, password_hash, first_name, last_name, phone, avatar_url, roles,
             is_verified, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, first_name, last_name, phone, avatar_url, roles,
             is_verified, is_active, last_login, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateLastLogin(id: string): Promise<void> {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await pool.query(query, [id]);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
