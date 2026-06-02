let express = require('express')
let cors = require('cors');
let app = express();
let PORT = 3000;

app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({status: 'ok'});
});

app.listen(PORT, () => {
    console.log(`Hello, Backend running on http://localhost:${PORT}`);
});