const express = require('express');
const db = require('../database/init');
const router = express.Router();

// GET all customers with optional search, sorting, and pagination
router.get('/', (req, res) => {
  const { search, sortBy = 'last_name', sortOrder = 'ASC', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  let sql = `SELECT * FROM customers`;
  let countSql = `SELECT COUNT(*) as total FROM customers`;
  let params = [];
  let whereClauses = [];
  
  // Add search functionality
  if (search) {
    whereClauses.push(`(first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(' AND ')}`;
    countSql += ` WHERE ${whereClauses.join(' AND ')}`;
  }
  
  // Add sorting
  sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  
  // Add pagination
  sql += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  // Get total count
  db.get(countSql, params.slice(0, -2), (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Get paginated results
    db.all(sql, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
});

// GET single customer
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM customers WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ data: row });
  });
});

//  create new customer
router.post('/', (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
  
  // Validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  db.run(
    'INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)',
    [first_name, last_name, phone_number],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        message: 'Customer created successfully',
        data: { id: this.lastID, first_name, last_name, phone_number }
      });
    }
  );
});

// update customer
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone_number } = req.body;
  
  // Validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  db.run(
    'UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?',
    [first_name, last_name, phone_number, id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Phone number already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json({ message: 'Customer updated successfully' });
    }
  );
});

// DELETE customer
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM customers WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  });
});

module.exports = router;