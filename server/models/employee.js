const mongo = require('mongoose');
const Schema = mongo.Schema;

// Define collection and schema
let Employee = new Schema({
  empId : {type: String, unique: true, index: true},
  firstName: {type: String},
  lastName: {type: String},
  role: {type: String},
  deleted: {type: Boolean},
  todo: [],
  done: []
}, {
   collection: 'employees'
})

module.exports = mongo.model('Employee', Employee)
