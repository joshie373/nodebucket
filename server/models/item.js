const mongo = require('mongoose');
const Schema = mongo.Schema;

// Define item collection and schema
let Item = new Schema({
  text : {type: String}
})

module.exports = Item
