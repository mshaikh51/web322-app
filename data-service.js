const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "psqxicbk",
  "psqxicbk",
  "hB1oIZlVwbGA4jvuszwyyhm-UJrEGeFz",
  {
    host: "heffalump.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: true,
    },
    query: { raw: true }, // update here, you. Need this
  }
);
var Employee = sequelize.define("Employee", {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.DATE,
});
var Department = sequelize.define("Department", {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true, // automatically increment the value
  },
  departmentName: Sequelize.STRING,
});
Employee.belongsTo(Department, { foreignKey: "department" });

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    sequelize
      .authenticate()
      .then(() => console.log("Connection success."))
      .catch((err) => console.log("Unable to connect to DB.", err));
    sequelize
      .sync()
      .then(function () {
        console.log("Connection success.");
        resolve();
      })
      .catch(function (params) {
        reject("unable to sync the database");
      });
  });
};

module.exports.getAllEmployees = function () {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (data) {
        resolve(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  });
};

module.exports.getManagers = function () {
  return new Promise((resolve, reject) => {
    Managers.findAll()
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getDepartments = function () {
  return new Promise((resolve, reject) => {
    Department.findAll()
      .then(function (data) {
        resolve(data);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.addEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (I in employeeData) {
      if (employeeData[I] == "") {
        employeeData[I] == null;
      }
    }
    Employee.create(employeeData)
      .then(() => {
        resolve();
      })
      .catch(function () {
        reject("unable to create post");
      });
  });
};

module.exports.getEmployeeByStatus = function (status) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (status) {
        resolve(data.filter((employee) => employee.status == status));
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByDepartment = function (department) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (data) {
        resolve(data.filter((employee) => employee.department == department));
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeesByManager = function (manager) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (data) {
        resolve(
          data.filter((employee) => employee.employeeManagerNum == manager)
        );
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.getEmployeeByNum = function (value) {
  return new Promise((resolve, reject) => {
    Employee.findAll()
      .then(function (data) {
        resolve(data.filter((employee) => employee.employeeNum == value)[0]);
      })
      .catch(function () {
        reject("no results returned");
      });
  });
};

module.exports.updateEmployee = function (employeeData) {
  return new Promise((resolve, reject) => {
    employeeData.isManager = employeeData.isManager ? true : false;
    for (I in employeeData) {
      if (employeeData[I] == "") {
        employeeData[I] == null;
      }
    }
    Employee.update(
      {employeeData},
      {where:{employeeNum:employeeData.employeeNum}}).then(() => {
        console.log("created");
        resolve();
      })
      .catch(function () {
        reject("unable to create post");
      });
  });
};
module.exports.addDepartment = function (departmentData) {
  return new Promise((resolve, reject) => {
    for (I in departmentData) {
      if (departmentData[I] == "") {
        departmentData[I] == null;
      }
    }
    Department.create(departmentData)
      .then(() => {
        console.log("created");
        resolve();
      })
      .catch(function () {
        reject("unable to create post");
      });
  });
};
