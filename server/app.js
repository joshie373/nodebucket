/**
 * Require statements
 */
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

/**
 * App configurations
 */
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': true}));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../dist/nodebucket')));
app.use('/', express.static(path.join(__dirname, '../dist/nodebucket')));
app.use(cors());
/**
 * Variables
 */
const port = 3000 || process.env.PORT; // server port

// TODO: This line will need to be replaced with your actual database connection string
// const conn = 'mongodb://localhost:27017/nodebucket?retryWrites=true&w=majority';//local datastring
const conn = 'mongodb+srv://21216666:Kenneth37@buwebdev-cluster-1-z8vdl.mongodb.net/nodebucket?retryWrites=true&w=majority';

/**
 * Database connection
 */
mongoose.connect(conn, {
  promiseLibrary: require('bluebird'),
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  console.debug(`Connection to the database instance was successful`);
}).catch(err => {
  console.log(`MongoDB Error: ${err.message}`)
}); // end mongoose connection

/**
 * API(s)
 */
//imports employee model
const Employee = require("./models/employee");

//handles finding employee by id
app.get("/api/employees/:empId", function (request, response) {
  var empId = request.params.empId;
  Employee.find({'empId': empId}, function(error, data) {
      if (error) throw error;
      // console.log(data);
      response.json(data);
  });
});

//handles find all employees
app.get("/api/employees", function (request, response) {
  Employee.find({},function(error, data) {
      if (error) throw error;
      // console.log(data);
      response.json(data);
  });
});


/**
 * Create and start server
 */
http.createServer(app).listen(port, function() {
  console.log(`Application started and listening on port: ${port}`)
}); // end http create server function

/**
 * error handlers
*/
app.use(function (err, req, res, next) {
  console.error(err.message); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message); // All HTTP requests must have a response, so let's send back an error with its status code and message
});

