/* https://infinite-caverns-60557.herokuapp.com/ */
/* A5 - Solution */

const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
//const bodyParser = require("body-parser");
const fs = require("fs");
//const exphbs = require("express-handlebars");
const { engine } = require("express-handlebars");
const data_service = require("./data-service.js");
const dataServiceAuth = require("./data-service-auth.js");
const HTTP_PORT = process.env.PORT || 8080;
const clientSessions = require("client-sessions");
// call this function after the http server starts listening
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"));
// Setup client-sessions
app.use(
  clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 20 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 91000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// This is a helper middleware function that checks if a user is logged in
// we can use it in any route that we want to protect against unauthenticated access.
// A more advanced version of this would include checks for authorization as well after
// checking if the user is authenticated
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

/* A4 -  beginning */
// handle active route
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

//setting express-handlebars
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",

    helpers: {
      navLink: function (url, options) {
        return (
          "<li" +
          (url == app.locals.activeRoute ? ' class = "active" ' : "") +
          '><a href="' +
          url +
          '">' +
          options.fn(this) +
          "</a> </li>"
        );
      }, // helpers: navLink
      /* e.g.,
              {{#equal employee.status "Full Time" }}checked{{/equal}} */
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters.");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      }, // helpers:equal
    }, //// helpers
    defaultLayout: "main",
  })
);
app.set("view engine", ".hbs");

/* A4 - setting  express-handlebars - ending */

//A3- define storage destination
// multer: for form with file upload
const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
var upload = multer({ storage: storage });

// body-parser: for form without file upload
//app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//set up default route
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

//adding more routes
/*  A2 - 
app.get("/employees", (req,res)=>{
    data_service.getAllEmployees().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(err);
    });
});
- A2 modified in A3, below */
//A3- part 4
app.get("/employees", ensureLogin, (req, res) => {
  if (req.query.status) {
    data_service
      .getEmployeesByStatus(req.query.status)
      .then((data) => {
        // res.json(data);
        // res.render("employees", {employees:data});
        res.render(
          "employees",
          data.length > 0 ? { employees: data } : { message: "No results" }
        );
      })
      .catch((reason) => {
        res.render({ message: reason });
        //res.json({message:reason});
      });
  } else if (req.query.department) {
    data_service
      .getEmployeesByDepartment(req.query.department)
      .then((data) => {
        // res.json(data);
        // res.render("employees", {employees:data});
        res.render(
          "employees",
          data.length > 0 ? { employees: data } : { message: "No results" }
        );
      })
      .catch((reason) => res.render({ message: reason }));
    //res.json({message:reason}));
  } else if (req.query.manager) {
    data_service
      .getEmployeesByManager(req.query.manager)
      .then((data) => {
        //res.json(data);
        //res.render("employees", {employees:data});
        res.render(
          "employees",
          data.length > 0 ? { employees: data } : { message: "No results" }
        );
      })
      .catch((reason) => res.render({ message: reason }));
    //res.json({message:reason}));
  } else {
    data_service
      .getAllEmployees()
      .then((data) => {
        // res.json(data);
        // res.render("employees", {employees:data});
        res.render(
          "employees",
          data.length > 0 ? { employees: data } : { message: "No results" }
        );
      })
      .catch((err) => {
        // res.json({message: err});
        res.render({ message: err });
      });
  } // if no query, response all employees
}); // end of: app.get("/employees", (req,res)=>{

app.get("/employee/:empNum", ensureLogin, (req, res) => {
  /* initialize an empty object to store the values of employee (obj, current employee) 
        and departments(array of objs) */
  let viewData = {};

  data_service
    .getEmployeeByNum(req.params.empNum)
    .then((data) => {
      if (data) {
        //data is the employee obj from the getEmployeeByNum()
        viewData.employee = data; //store employee data (obj) in the object "viewData" as "employee" (obj, property of viewData obj)
      } else {
        viewData.employee = null; //set employee (property of viewData obj) to null if none were returned
      }
    })
    .catch(() => {
      viewData.employee = null; ////set employee (property of viewData obj) to null if error to get the employee
    })
    .then(data_service.getDepartments)
    //if getEmployeeByNum() successful, then call function getDepartments()
    .then((data) => {
      viewData.departments = data; //store department data in the "viewData" object as "departments"
      /* loop through viewData.departments and once we have found the 
                departmentId that matches the employee's "department" value, 
                add a "selected" property to the matching viewData.departments obj 
            */
      for (let i = 0; i < viewData.departments.length; i++) {
        if (
          viewData.departments[i].departmentId == viewData.employee.department
        ) {
          viewData.departments[i].selected = true;
        }
      } // for
    })
    .catch(() => {
      viewData.departments = []; //set departments to empty array if error in getDepartments()
    })
    .then(() => {
      if (viewData.employee == null) {
        // if no employee, return error
        res.status(404).send("Employee Not found");
      } else {
        /* render the employee view with the data as "viewData",
                    which is an object with two properties: employee (obj, and departments (array of objs) */
        res.render("employee", { viewData: viewData });
      }
    });
});

app.get("/employees/delete/:empNum", ensureLogin, (req, res) => {
  data_service
    .deleteEmployeeByNum(req.params.empNum)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Unable to remove employee.");
    });
});

app.get("/departments", ensureLogin, (req, res) => {
  data_service
    .getDepartments()
    .then((data) => {
      console.log(data);
      //res.json(data);
      // res.render("departments", {departments: data});
      res.render(
        "departments",
        data.length > 0 ? { departments: data } : { message: "No results." }
      );
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/employees/add", ensureLogin, (req, res) => {
  data_service
    .getDepartments()
    .then((data) => {
      res.render("addEmployee", { departments: data });
    })
    .catch((err) => {
      res.render("addEmployee", { departments: [] });
    });
});

app.get("/images/add", ensureLogin, (req, res) => {
  //res.send("images");
  res.render("addImage");
});

app.get("/images", ensureLogin, (req, res) => {
  fs.readdir("./public/images/uploaded", function (err, items) {
    // this was in A3, was changed to res.render() in A4
    //res.json({images:items});
    // res.render("images");
    res.render("images", { images: items });
  });
});

app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.post("/employees/add", ensureLogin, (req, res) => {
  data_service
    .addEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("addEmployee", { message: err });
    });
});

/*** A3 end ****/
//A4
app.post("/employee/update", ensureLogin, (req, res) => {
  // console.log(req.body);
  data_service
    .updateEmployee(req.body)
    .then(() => {
      res.redirect("/employees");
    })
    .catch((err) => {
      res.render("employees, ", { message: err });
    });
});
/****  A5 begins  ****/
app.get("/departments/add", ensureLogin, (req, res) => {
  //res.send("add employees");
  res.render("addDepartment");
});

app.post("/departments/add", ensureLogin, (req, res) => {
  data_service
    .addDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to add the deparmtment.");
    });
});

app.post("/department/update", ensureLogin, (req, res) => {
  data_service
    .updateDepartment(req.body)
    .then(() => {
      res.redirect("/departments");
    })
    .catch((err) => {
      res.status(500).send("Unable to update the department.");
    });
});

app.get("/department/:departmentId", ensureLogin, (req, res) => {
  data_service
    .getDepartmentById(req.params.departmentId)
    .then((data) => {
      if (!data) {
        res.status(404).send("Department not found");
      } else {
        res.render("department", { department: data });
      }
    })
    .catch((err) => {
      res.status(404).send("Departmen not found.");
    });
});

/****  A5 ends  ****/
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  dataServiceAuth
    .registerUser(req.body)
    .then(function () {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.post("/login",(req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUser(req.body).then((user) => {
        req.session.user = {
        userName:user.userName,// … // complete it with authenticated user's userName
        email:user.email,// … // complete it with authenticated user's email
        loginHistory:user.loginHistory,// … // complete it with authenticated user's loginHistory
        }
        res.redirect('/employees');
       })
       .catch((err) => {
        console.log("failed");
        console.log(err);
         res.render("login", {
           errorMessage: err,
           userName: req.body.userName,
         });
       });
       
});

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/");
  });

app.get("/userHistory", (req, res) => {
    res.render("userHistory");
  });
  

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

data_service
  .initialize()
  .then(dataServiceAuth.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT);
    });
  })
  .catch(function (err) {
    console.log("unable to start server: " + err);
  });

/*
data_service.initialize().then(()=>{
    //listen on HTTP_PORT
    app.listen(HTTP_PORT, onHttpStart);
}).catch(()=>{
    console.log("Cannot open files.");
});*/
