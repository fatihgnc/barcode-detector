const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    name: String,
    price: Number,
    purchaseDate: Date,
    changeFromLastPurchase: String,
});

module.exports = mongoose.model('Expense', expenseSchema);
