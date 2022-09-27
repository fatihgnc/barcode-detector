const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const Product = require('./models/product');
const Expense = require('./models/expense');

const app = express();

const mongoURL = 'mongodb://localhost:27017/barcode';
mongoose
    .connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((_) => console.log('connected to DB'))
    .catch((err) => console.log(err));

app.use(express.json());
app.use(cors());

app.post('/checkProduct', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.json({ error: true, message: 'code is missing' });
    }

    try {
        // check if product with this id exists
        const product = await Product.findOne({ code }).exec();

        if (!product) {
            console.log('product is not in db');
            return res.json({ isSaved: false });
        }

        console.log('product is in db');
        res.json({ isSaved: true, name: product.name });
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

app.post('/addProduct', async (req, res) => {
    const { code, name } = req.body;

    if (!code || !name)
        return res.json({ error: true, message: 'code and name is required' });

    try {
        const productFromDb = await Product.findOne({ code }).exec();

        if (productFromDb) {
            return res.json({ info: true, message: 'product exists' });
        }

        const product = new Product({
            code,
            name,
            date: new Date().toUTCString(),
        });
        await product.save();
        console.log('product saved to db');
        res.json();
    } catch (error) {
        res.json({
            error: true,
            code: error.message,
        });
    }
});

app.post('/addExpense', async (req, res) => {
    const { price, code } = req.body;

    if (!price || !code || parseInt(price) <= 0) {
        return res.json({
            error: true,
            message: 'invalid or missing price/code',
        });
    }

    try {
        const product = await Product.findOne({ code }).exec();
        const expensesFromDb = await Expense.find({
            name: product.name,
        }).exec();
        if (!expensesFromDb || expensesFromDb.length === 0) {
            const expense = new Expense({
                name: product.name,
                price,
                purchaseDate: new Date().toUTCString(),
                changeFromLastPurchase: '0%',
            });
            await expense.save();
            console.log('no prev expense');
        } else {
            if (!Array.isArray(expensesFromDb)) {
                const expense = new Expense({
                    name: product.name,
                    price,
                    purchaseDate: new Date().toUTCString(),
                    changeFromLastPurchase:
                        ((price * 100) / expensesFromDb.price - 100)
                            .toFixed(2)
                            .toString() + '%',
                });
                await expense.save();
            } else {
                const expense = new Expense({
                    name: product.name,
                    price,
                    purchaseDate: new Date().toUTCString(),
                    changeFromLastPurchase:
                        (
                            (price * 100) /
                                expensesFromDb[expensesFromDb.length - 1]
                                    .price -
                            100
                        )
                            .toFixed(2)
                            .toString() + '%',
                });
                await expense.save();
            }
        }
        console.log('expense is saved');
        res.json();
    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('listening on port 3000'));
