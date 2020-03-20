const mongo = require('mongoose');
const Schema = mongo.Schema;
const Item = require('./item');

// Define employee collection and schema
let Employee = new Schema({
  empId : {type: String, unique: true, index: true},
  firstName: {type: String},
  lastName: {type: String},
  role: {type: String},
  deleted: {type: Boolean},
  todo: [Item],
  done: [Item]
}, {
   collection: 'employees'
})

module.exports = mongo.model('Employee', Employee)
