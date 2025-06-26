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

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
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

  static async updateProfile(id: string, profileData: UpdateProfileData): Promise<User> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build dynamic update query
    if (profileData.first_name !== undefined) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(profileData.first_name);
      paramCount++;
    }

    if (profileData.last_name !== undefined) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(profileData.last_name);
      paramCount++;
    }

    if (profileData.phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(profileData.phone || null);
      paramCount++;
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Add user ID as the last parameter
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount} AND is_active = true
      RETURNING id, email, first_name, last_name, phone, avatar_url, roles,
                is_verified, is_active, last_login, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('User not found or inactive');
    }

    return result.rows[0];
  }

  static async deactivateUser(id: string): Promise<void> {
    const query = `
      UPDATE users 
      SET is_active = false, updated_at = NOW() 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error('User not found');
    }
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Admin methods for future use
  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<User[]> {
    const query = `
      SELECT id, email, first_name, last_name, phone, avatar_url, roles,
             is_verified, is_active, last_login, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async getUserCount(): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM users WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}