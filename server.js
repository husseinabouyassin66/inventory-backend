const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: 'zephyr.proxy.rlwy.net',
    user: 'root',
    password: 'uEHKnDZxfjOqKyltoUNHVhNSilbaNYTz', // Corrected password
    database: 'railway',
    port: 54548, 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 1. READ ALL ITEMS (GET)
app.get('/items', (req, res) => {
    db.query('SELECT * FROM items', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. CREATE AN ITEM (POST)
app.post('/items', (req, res) => {
    const { name, quantity, price, category } = req.body;
    if (!name || !quantity || !price || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    db.query(
        'INSERT INTO items (name, quantity, price, category) VALUES (?, ?, ?, ?)',
        [name, quantity, price, category],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: results.insertId, name, quantity, price, category });
        }
    );
});

// 3. UPDATE AN ITEM (PUT)
app.put('/items/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, price, category } = req.body;
    db.query(
        'UPDATE items SET name = ?, quantity = ?, price = ?, category = ? WHERE id = ?',
        [name, quantity, price, category, id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Item updated successfully' });
        }
    );
});

// 4. DELETE AN ITEM (DELETE)
app.delete('/items/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM items WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item deleted successfully' });
    });
});

// Health check endpoint for Render deployment
app.get('/', (req, res) => {
    res.send('Inventory API is running live!');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
