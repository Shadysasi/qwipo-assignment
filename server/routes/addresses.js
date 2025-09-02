const express = require('express');
const db = require('../database/init');
const router = express.Router();

// GET all addresses for a customer
router.get('/customer/:customerId', (req, res) => {
  const { customerId } = req.params;
  
  db.all('SELECT * FROM addresses WHERE customer_id = ?', [customerId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    res.json({ data: rows });
  });
});

// create new address
router.post('/', (req, res) => {
  const { customer_id, address_details, city, state, pin_code } = req.body;
  
  // Validation
  if (!customer_id || !address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  db.run(
    'INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)',
    [customer_id, address_details, city, state, pin_code],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.status(201).json({
        message: 'Address created successfully',
        data: { 
          id: this.lastID, 
          customer_id, 
          address_details, 
          city, 
          state, 
          pin_code 
        }
      });
    }
  );
});

// update address
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { address_details, city, state, pin_code } = req.body;
  
  // Validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  db.run(
    'UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?',
    [address_details, city, state, pin_code, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      
      res.json({ message: 'Address updated successfully' });
    }
  );
});

// DELETE address
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM addresses WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }
    
    res.json({ message: 'Address deleted successfully' });
  });
});

module.exports = router;