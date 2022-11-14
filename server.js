/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students. *
* Name: Mohammed Mahi Shaikh Student ID:  147891212Date: Nov 10, 2020 *
* Online (Heroku) Link:  https://git.heroku.com/fathomless-dusk-20202.git
Github:https://github.com/mshaikh51/web322-app
* ********************************************************************************/
var path = require("path");
var express = require("express");
const multer = require("multer");
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var exphbs = require("express-handlebars");
const stripJs = require('strip-js');
app.engine('.hbs', exphbs.engine({
    extname: '.hbs'
    ,
    helpers: {
        navLink: function (url, options) {
            
            return '<li' +
                (((url) == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
})


var HTTP_PORT = process.env.PORT || 8080;
var data = require("./data-service");
var fs = require("fs");
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage });
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.use(express.static('public'));
app.get("/", function (req, res) {
    res.redirect("/home");
});

app.get("/home", function (req, res) {
    res.render("home");
})
app.get("/about", function (req, res) {
    res.render("about");
});

app.get("/employees", function (req, res) {
    if (req.query.status) {
        data.getEmployeeByStatus(req.query.status).then(function (data) {
            res.render("employees", { employees: data
             })
        }).catch((err) => {
            res.render({ message: "no results" });
        })
    }
    else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then(function (data) {
            res.render("employees", { employees: data })
        }).catch((err) => {
            res.render({ message: "no results" });
        })
    }
    else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then(function (data) {
            res.render("employees", { employees: data })
        }).catch((err) => {
            res.render({ message: "no results" });
        })
    }
    else {
        data.getAllEmployees().then(function (data) {
            res.render("employees", { employees: data })
        }).catch((err) => {
            res.render({ message: "no results" });
        })
    }
});

app.get("/employee/:value", function (req, res) {
    data.getEmployeeByNum(req.params.value).then((data) => {
    //    console.log(data);
        res.render("employee", {employee:data[0] });
    }).catch((err) => {
        res.render("employee", { message: "no results" });
    })
});
app.post("/employee/update", (req, res) => {
  //  console.log(req.body);
    data.updateEmployee(req.body).then(function () {
        res.redirect("/employees");
    })
});
app.get("/departments", function (req, res) {
    data.getDepartments().then(function (data) {
        res.render("departments", { departments: data });
    }).catch(function (err) {
        res.render({ message: "no results" });
    });
});
app.get('/employees/add', (req, res) => {
    res.render("addEmployee");
});

app.get('/images/add', (req, res) => {
    res.render("addImage");
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", function (req, res) {
    fs.readdir("./public/images/uploaded", function (err, items) {
        var message = {
            "images": items
        }
        res.render("images", { data: items });
    })
});

app.post('/employees/add', (req, res) => {
    data.addEmployee(req.body).then(() => {
        res.redirect("/employees");
    })
});

app.get('*', function (req, res) {
    res.send('<h1 class=\"error\">Page Not Found</h1>', 404);
});


data.initialize().then(function () {
    app.listen(HTTP_PORT, onHttpStart);
}).catch(function (data) {
    //when data is not loaded at all
    console.log(data);
});

