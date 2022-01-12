// const mongoose = require('mongoose');

// const { Schema } = mongoose;
// const userSchema = new Schema({
//     version:{ 
//      type: Number,
//      required: true,
//     },
//     index: {
//     type: Number,
//     required: true,
//   },
//   previousHash: {
//     type: String,
//     required: false,
//   },
//   timestamp: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
//   merkleRoot: {
//     type: String,
//     required: true,
//   },
//   difficulty: {
//     type: Number,
//     required: true,
//   },
//   hash: {
//     type: String,
//     required: true,
//   },
// });

// module.exports = mongoose.model('BlockChain', BlockChainSchema);