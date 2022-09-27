const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    code: Number,
    name: String,
});

module.exports = mongoose.model('Product', productSchema);
