const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT u.user_id, u.name, u.email, u.phone_number, u.created_at, r.role_name ' +
        'FROM Users u JOIN Roles r ON u.role_id = r.role_id'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.user_id, u.name, u.email, u.phone_number, u.profile_picture, u.created_at, r.role_name ' +
        'FROM Users u JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.user_id = ?',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByPhoneNumber(phoneNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.phone_number = ?',
        [phoneNumber]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByGoogleId(googleId) {
    try {
      const [rows] = await pool.execute(
        'SELECT u.*, r.role_name FROM Users u ' +
        'JOIN Roles r ON u.role_id = r.role_id ' +
        'WHERE u.google_id = ?',
        [googleId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    const { name, email, password, phoneNumber, googleId, googleEmail, profilePicture, roleId } = userData;
    
    try {
      // For non-OAuth users, hash password
      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }
      
      const [result] = await pool.execute(
        'INSERT INTO Users (name, email, password, phone_number, google_id, google_email, profile_picture, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phoneNumber || null, googleId || null, googleEmail || null, profilePicture || null, roleId]
      );
      
      return {
        userId: result.insertId,
        name,
        email,
        phoneNumber,
        googleId,
        profilePicture,
        roleId
      };
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateGoogleInfo(userId, googleInfo) {
    try {
      const { googleId, googleEmail, profilePicture } = googleInfo;
      
      const [result] = await pool.execute(
        'UPDATE Users SET google_id = ?, google_email = ?, profile_picture = ? WHERE user_id = ?',
        [googleId, googleEmail, profilePicture, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      // Return updated user
      return await this.findById(userId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 