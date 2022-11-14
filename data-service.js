var employees = [];
var departments = [];
var fs = require("fs");
const { get } = require("http");
module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        getData('./data/employees.json').then(function (data) {
            employees=data;
            getData('./data/departments.json').then(function (data1) {
                departments=data1;
                resolve();
            }).catch(function () {
                reject("unable to read file");
            })

        }).catch(function () {
            reject("unable to read file");
        });
    });
}

function getData(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) reject();
            resolve(JSON.parse(data));
        })
    }
    );
}


module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {
        // console.log("employees",employees);
        if (employees.length == 0) {
            reject("no results returned");
        }
        resolve(employees);
    })
}

module.exports.getManagers = function () {
    return new Promise((resolve, reject) => {
        let managers = [];
        for (i in employees) {
            if (employees[i]["isManager"] == true)
                managers.push(employees[i]);
        }
        if (managers.length == 0) {
            reject("no results returned");
        }
        resolve(managers);
    })
}

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        if (departments.length == 0) {
            reject("no results returned");
        }
        resolve(departments);
    })
}

module.exports.addEmployee = function(employeeData){
    if(employeeData.isManager==undefined) 
    employeeData.isManager = false
    else
    employeeData.isManager = true;
    employeeData.employeeNum = employees.length + 1;
    employees.push(employeeData);
    return new Promise((resolve,reject) => {
        if (employees.length == 0) {
            reject ("no results");
        }
        else {
            resolve(employees);
        }
    })
};

module.exports.getEmployeeByStatus = function(status){
    return new Promise((resolve,reject) => {
        let my_status = employees.filter(employee => employee.status == status);
        if (my_status.length == 0) {
            reject('no results');
        }
        resolve(my_status);
    })
};

module.exports.getEmployeesByDepartment = function(department){
    return new Promise ((resolve,reject) => {
        var mydep = employees.filter(employee => employee.department == department);        
        if (mydep.length == 0) {
            reject ('department not found');
        }
        resolve(mydep);
    })
};

module.exports.getEmployeesByManager = function(manager){
    return new Promise ((resolve,reject) => {
        var my_man = employees.filter(employee => employee.employeeManagerNum == manager);
        if (my_man.length == 0) {
            reject('manager not found');
        }
        resolve(my_man);
    })
};

module.exports.getEmployeeByNum =function(value){
    return new Promise((resolve,reject) => {
        var my_num = employees.filter(employee => employee.employeeNum == value);
        if (my_num.length == 0) {
            reject('no employee found');
        }
        resolve(my_num);
    })
}

module.exports.updateEmployee=function(employeeData){
    console.log("finding");
    console.log(employeeData);
    return new Promise(function (resolve,reject) {
        for (i in employees) {
            if (employees[i].employeeNum == employeeData.employeeNum){
                console.log("match found");
                employees[i]=employeeData;
            }

            resolve();
        }
        reject();
    })
} 