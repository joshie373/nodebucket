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
  useNewUrlParser: true,
  useCreateIndex: true
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

//findEmployeeById
app.get("/api/employees/:empId", function (request, response) {
  var empId = request.params.empId;
  Employee.find({'empId': empId}, function(error, employee) {
    if (error) {
      console.log(error);
      return next(error);
    }
    else{
      console.log(employee);
      response.json(employee);
    }
  });
});


//findAllTasks
app.get("/api/employees/:empId/tasks", function (request, response,next) {
  var empId = request.params.empId;
  Employee.findOne({'empId': empId},'empId todo done', function(error, employee) {
    if (error) {
      console.log(error);
      return next(error);
    }
    else{
      console.log(employee);
      response.json(employee);
    }

  });
});

//CreateTask
app.post("/api/employees/:empId/tasks", function (request,response,next) {
  var empId = request.params.empId;
  Employee.findOne({'empId': empId}, function(err, employee) {
      if (err) {
        console.log(err);
        return next(err);
      }
      else{
        console.log(employee);

        const item = {
          text: request.body.text
        };

        employee.todo.push(item);
        employee.save(function(err, employee){
          if(err){
            console.log(err);
            return next(err);
          }
          else{
            console.log(employee);
            response.json(employee);
          }
        });

      }
  });
});

//Update Task
app.put("/api/employees/:empId/tasks/", function(req, res, next) {
  Employee.findOne({ 'empId': req.params.empId }, function(err, employee) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      console.log(employee);
      console.log("reqBod");
      console.log(req.body);
      employee.set({
        'todo': req.body.todo,
        'done': req.body.done
      });
      console.log(employee);
      employee.save(function(err, employee) {
        if (err) {
          console.log(err);
          return next(err);
        } else {
          console.log(employee);
          res.json(employee);
        }
      });
    }
  });
});





// DeleteTask API - an API that's used to delete a specific task for a single employee
app.delete("/api/employees/:empId/tasks/:taskId", function(req, res, next) {
  Employee.findOne({ empId: req.params.empId }, function(err, employee) {
    if (err) {
      console.log(err);
      return next(err);
    } else {
      console.log(employee);
      const todoItem = employee.todo.find(
        item => item._id.toString() === req.params.taskId
      );
      const doneItem = employee.done.find(
        item => item._id.toString() === req.params.taskId
      );
      if (todoItem) {
        employee.todo.id(todoItem._id).remove();
        employee.save(function(err, emp1) {
          if (err) {
            console.log(err);
            return next(err);
          } else {
            console.log(emp1);
            res.json(emp1);
          }
        });
      } else if (doneItem) {
        employee.done.id(doneItem._id).remove();
        employee.save(function(err, emp2) {
          if (err) {
            console.log(err);
            return next(err);
          } else {
            console.log(emp2);
            res.json(emp2);
          }
        });
      } else {
        console.log("Unable to locate task: ${{req.params.taskId}}");
        console.log(req.params.taskId);
        res.status(200).send({
          type: "warning",
          text: "Unable to locate task: ${{req.params.taskId}}"
        });
      }
    }
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
app.use(function (err, request, res, next) {
  console.error(err.message); // Log error message in our server's console
  if (!err.statusCode) err.statusCode = 500; // If err has no specified error code, set error code to 'Internal Server Error (500)'
  res.status(err.statusCode).send(err.message); // All HTTP requestuests must have a response, so let's send back an error with its status code and message
});

