const { pool } = require('../config/db');
const Cart = require('./cart');

class Order {
  // Get all orders (admin only)
  static async findAll(limit = 20, offset = 0) {
    try {
      // Ensure limit and offset are integers
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      const [orders] = await pool.execute(
        `SELECT o.*, u.name as user_name, u.email as user_email,
                a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         JOIN Users u ON o.user_id = u.user_id
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         ORDER BY o.order_date DESC
         LIMIT ${limit} OFFSET ${offset}`
      );
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Get order by ID
  static async findById(orderId) {
    try {
      // Get order details
      const [orders] = await pool.execute(
        `SELECT o.*, u.name as user_name, u.email as user_email,
                a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         JOIN Users u ON o.user_id = u.user_id
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.order_id = ?`,
        [orderId]
      );
      
      if (orders.length === 0) {
        return null;
      }
      
      const order = orders[0];
      
      // Get order items
      const [items] = await pool.execute(
        `SELECT oi.*, p.name, p.image_url, c.name as category_name
         FROM Order_Items oi
         JOIN Products p ON oi.product_id = p.product_id
         LEFT JOIN Categories c ON p.category_id = c.category_id
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      return {
        ...order,
        items
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Get orders by user ID
  static async findByUserId(userId, limit = 20, offset = 0) {
    try {
      // Ensure limit and offset are integers
      limit = parseInt(limit, 10);
      offset = parseInt(offset, 10);
      
      const [orders] = await pool.execute(
        `SELECT o.*, a.address_line, a.city, a.state, a.zip_code, a.country, a.phone_number
         FROM Orders o
         LEFT JOIN Addresses a ON o.address_id = a.address_id
         WHERE o.user_id = ?
         ORDER BY o.order_date DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [userId]
      );
      
      // Get items for each order
      for (let order of orders) {
        const [items] = await pool.execute(
          `SELECT oi.*, p.name, p.image_url, c.name as category_name
           FROM Order_Items oi
           JOIN Products p ON oi.product_id = p.product_id
           LEFT JOIN Categories c ON p.category_id = c.category_id
           WHERE oi.order_id = ?`,
          [order.order_id]
        );
        
        order.items = items;
      }
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new order from cart
  static async createFromCart(userId, addressId, paymentMethod = 'Cash on Delivery') {
    try {
      // Start a transaction
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        // Get user's cart with items
        const cart = await Cart.findByUserId(userId);
        
        if (cart.items.length === 0) {
          throw new Error('Cart is empty');
        }
        
        // Calculate total price
        const totalPrice = parseFloat(cart.subtotal);
        
        // Create order
        const [orderResult] = await connection.execute(
          `INSERT INTO Orders 
           (user_id, address_id, total_price, status, payment_method) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, addressId, totalPrice, 'pending', paymentMethod]
        );
        
        const orderId = orderResult.insertId;
        
        // Create order items
        for (const item of cart.items) {
          await connection.execute(
            `INSERT INTO Order_Items 
             (order_id, product_id, quantity, price) 
             VALUES (?, ?, ?, ?)`,
            [orderId, item.product_id, item.quantity, item.price]
          );
          
          // Update product inventory
          await connection.execute(
            `UPDATE Products 
             SET quantity = quantity - ? 
             WHERE product_id = ?`,
            [item.quantity, item.product_id]
          );
        }
        
        // Clear cart
        await Cart.clearCart(userId);
        
        // Commit transaction
        await connection.commit();
        
        // Return order details
        return {
          orderId,
          userId,
          addressId,
          totalPrice,
          status: 'pending',
          paymentMethod,
          items: cart.items.map(item => ({
            productId: item.product_id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            totalPrice: item.total_price
          }))
        };
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
      } finally {
        // Release connection
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Update order status
  static async updateStatus(orderId, status) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const [result] = await pool.execute(
        'UPDATE Orders SET status = ? WHERE order_id = ?',
        [status, orderId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return { orderId, status };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Order; 