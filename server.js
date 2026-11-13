// ==========================================
// R.K. Enterprise - Simple Backend Server
// ==========================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DB_FILE = path.join(__dirname, 'orders.json');

// જો ડેટાબેઝ ફાઇલ ન હોય તો ખાલી એરે સાથે બનાવી દો
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    // CORS હેડર્સ સેટ કરો જેથી વેબસાઇટ સાથે કનેક્ટ થઈ શકે
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ઓર્ડર સેવ કરવા માટેની API (POST /api/orders)
    if (req.method === 'POST' && req.url === '/api/orders') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const newOrder = JSON.parse(body);
                newOrder.id = "ORD-" + Date.now();
                newOrder.date = new Date().toLocaleString();

                // હાલની ફાઇલ વાંચો
                const fileData = fs.readFileSync(DB_FILE, 'utf8');
                const orders = JSON.parse(fileData);

                // નવો ઓર્ડર ઉમેરો
                orders.push(newOrder);

                // ફાઇલમાં પાછો ડેટા સેવ કરો (ડેટાબેઝ ફાઇલ અપડેટ)
                fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'ઓર્ડર સફળતાપૂર્વક સેવ થઈ ગયો!', order: newOrder }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'ખોટો ડેટા格式 છે.' }));
            }
        });
    } 
    // બધા ઓર્ડર મેળવવા માટેની API (GET /api/orders)
    else if (req.method === 'GET' && req.url === '/api/orders') {
        try {
            const fileData = fs.readFileSync(DB_FILE, 'utf8');
            const orders = JSON.parse(fileData);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(orders));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'ડેટા વાંચવામાં ભૂલ થઈ.' }));
        }
    } 
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'પેજ મળ્યું નથી.' }));
    }
});

server.listen(PORT, () => {
    console.log(`સર્વર આ પર ચાલી રહ્યું છે: http://localhost:${PORT}`);
});
