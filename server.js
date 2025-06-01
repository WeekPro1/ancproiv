const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.static('.'));
app.use(express.json());

app.get('/api/products', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        res.json(JSON.parse(data));
    });
});

app.post('/api/products', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        const products = JSON.parse(data);
        const newProduct = {
            id: Date.now(),
            ...req.body
        };
        products.push(newProduct);
        fs.writeFile('data.json', JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).send('Server Error');
            res.status(201).json(newProduct);
        });
    });
});

app.delete('/api/products/:id', (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        let products = JSON.parse(data);
        products = products.filter(p => p.id != req.params.id);
        fs.writeFile('data.json', JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).send('Server Error');
            res.status(204).end();
        });
    });
});


app.put('/api/products/:id', (req, res0) => {
    fs.readFile('data.json', (err, data) => {
        if (err) return res.status(500).send('Server Error');
        let products = JSON.parse(data);
        const index = products.findIndex(p => p.id == req.params.id);
        if (index === -1) return res.status(404).send('Product not found');
        products[index] = {
            id: parseInt(req.params.id),
            ...req.body
        };
        fs.writeFile('data.json', JSON.stringify(products, null, 2), err => {
            if (err) return res.status(500).send('Server Error');
            res.json(products[index]);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});