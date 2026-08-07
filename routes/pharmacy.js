const express = require('express');
const pool = require('../db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
router.use(requireLogin);

function blockPatients(req, res, next) {
  if (req.session.user.role === 'PATIENT') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only admin staff can modify inventory.' });
  }
  next();
}

// GET /api/pharmacy         -> ADMIN/NURSE/DOCTOR can view
// GET /api/pharmacy?id=5    -> single item
router.get('/', blockPatients, async (req, res) => {
  try {
    if (req.query.id) {
      const [rows] = await pool.execute('SELECT * FROM pharmacy_inventory WHERE item_id = ?', [req.query.id]);
      if (!rows[0]) return res.status(404).json({ success: false, message: 'Item not found.' });
      return res.json({ success: true, message: 'OK', data: rows[0] });
    }
    const [rows] = await pool.execute('SELECT * FROM pharmacy_inventory ORDER BY item_name');
    res.json({ success: true, message: 'OK', data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// POST /api/pharmacy - ADMIN only. Body: { itemName, category, quantity, unitPrice, expiryDate, supplier, reorderLevel }
router.post('/', requireAdmin, async (req, res) => {
  const { itemName, category, quantity, unitPrice, expiryDate, supplier, reorderLevel } = req.body;
  if (!itemName || unitPrice === undefined) {
    return res.status(400).json({ success: false, message: 'itemName and unitPrice are required.' });
  }
  try {
    const [result] = await pool.execute(
      `INSERT INTO pharmacy_inventory (item_name, category, quantity, unit_price, expiry_date, supplier, reorder_level)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [itemName, category || null, quantity || 0, unitPrice, expiryDate || null, supplier || null, reorderLevel || 10]
    );
    res.status(201).json({ success: true, message: 'Item added.', data: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// PUT /api/pharmacy?id=5 - ADMIN only, full update
router.put('/', requireAdmin, async (req, res) => {
  if (!req.query.id) return res.status(400).json({ success: false, message: 'id query parameter is required.' });
  const { itemName, category, quantity, unitPrice, expiryDate, supplier, reorderLevel } = req.body;
  try {
    const [result] = await pool.execute(
      `UPDATE pharmacy_inventory SET item_name=?, category=?, quantity=?, unit_price=?,
       expiry_date=?, supplier=?, reorder_level=? WHERE item_id=?`,
      [itemName, category || null, quantity || 0, unitPrice, expiryDate || null,
       supplier || null, reorderLevel || 10, req.query.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

// DELETE /api/pharmacy?id=5 - ADMIN only
router.delete('/', requireAdmin, async (req, res) => {
  if (!req.query.id) return res.status(400).json({ success: false, message: 'id query parameter is required.' });
  try {
    const [result] = await pool.execute('DELETE FROM pharmacy_inventory WHERE item_id = ?', [req.query.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error: ' + err.message });
  }
});

module.exports = router;
