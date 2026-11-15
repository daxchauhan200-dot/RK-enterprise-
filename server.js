// =================================================================
// RK ENTERPRISE - BACKEND SERVER (Node.js & Express)
// =================================================================
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Ensure orders.json exists
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

// API: Get all orders
app.get('/api/orders', (req, res) => {
    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("ਡેટા વાંચવામાં ભૂલ:", err);
            return res.status(500).json({ error: "સર્વર એરર" });
        }
        try {
            const orders = JSON.parse(data || '[]');
            res.json(orders);
        } catch (parseErr) {
            res.json([]);
        }
    });
});

// API: Save a new order
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    
    if (!newOrder.customerName || !newOrder.phone || !newOrder.totalAmount) {
        return res.status(400).json({ error: "જરૂરી માહિતી ખૂટે છે." });
    }

    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        let orders = [];
        try {
            orders = JSON.parse(data || '[]');
        } catch (e) {
            orders = [];
        }

        newOrder.id = "ORD-" + Date.now();
        newOrder.date = new Date().toLocaleString();
        orders.push(newOrder);

        fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("ઓર્ડર સેવ કરવામાં ભૂલ:", writeErr);
                return res.status(500).json({ error: "ઓર્ડર સેવ કરવામાં નિષ્ફળતા" });
            }
            res.status(201).json({ success: true, message: "ઓર્ડર સફળતાપૂર્વક સેવ થયો!", order: newOrder });
        });
    });
});

// API: Delete an order
app.delete('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;

    fs.readFile(ORDERS_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "સર્વર એરર" });

        let orders = [];
        try {
            orders = JSON.parse(data || '[]');
        } catch (e) {
            orders = [];
        }

        const filteredOrders = orders.filter(o => o.id !== orderId);

        fs.writeFile(ORDERS_FILE, JSON.stringify(filteredOrders, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: "ડિલીટ કરવામાં ભૂલ" });
            res.json({ success: true, message: "ઓર્ડર ડિલીટ થઈ ગયો." });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`RK Enterprise Backend Server running on port ${PORT}`);
});
