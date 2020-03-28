const mongo = require('mongoose');
const Schema = mongo.Schema;

// Define item collection and schema
let Item = new Schema({
  text : {type: String},
  dueDate: {type: Date},
  dateAdded: {type: Date},
  dateLastModified: {type: Date},
  lastModifiedBy:{type: String}
})

module.exports = Item
