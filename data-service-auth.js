// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

let db1; // = mongoose.createConnection("mongodb+srv://dbuser:dbuser@testdb.phk2la4.mongodb.net/?retryWrites=true&w=majority");

// define the User schema
var userSchema = new Schema({
  userName: { type: String, unique: true },
  pasword: String,
  email: String,
  loginHistory: [{ dateTime: Date, userAgent: String }],
});

let User; //
module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    // verify the db1 connection
    let db1 = mongoose.createConnection(
      "mongodb+srv://dbuser:dbuser@testdb.phk2la4.mongodb.net/test?retryWrites=true&w=majority"
    );

    //console.log("\n\n\n\n\nMAKING CONNECTION\n\n\n\n");
    db1.on("error", (err) => {
      console.log("db error!");
      console.log(err);
      reject(err);
    });
    //console.log("\n\n\n\n\nMAKING CONNECTION\n\n\n\n");

    db1.once("open", () => {
      console.log("db success!");
      User = mongoose.model("Users", userSchema);
      resolve();
    });
  }); // promise end
}; //initialize
module.exports.registerUser = function (userData) {
  return new Promise((resolve, reject) => {
    //   var sd="sdsad".ma
    //var pass=/[\s]*/.test(userData.userName);
    if (userData.userName != "") {
      //  pass=/[\s]*/.test(userData.password);
      console.log(userData.password !== "");
      //  console.log(pass);
      if (userData.password !== "") {
        if (userData.password != userData.password2) {
          reject("Error: Passwords do not match");
        } else {
            bcrypt.hash((userData.password, 10).then(hash=>{
                userData.password=hash;
                let newUser = new User(userData);
          newUser
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
                }).catch(()=>{
                    reject("can't encrypt password");
                }));
        }
      } else {
        console.log("password is:" + userData.password + ";");
        reject("Error: password cannot be empty or only white spaces! ");
      }
    } else {
      console.log("username is:" + userData.userName + ";");
      reject("Error: user name cannot be empty or only white spaces! ");
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise((resolve, reject) => {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        console.log("found");
        users = users.map((value) => value.toObject());
        if (users.lenght >= 1) {
            bcrypt.compare(userData.password,users[0].password).then((res) => {
                // res === true if it matches and res === false if it does not match
            if (res==true) {
            users[0].loginHistory.add({
              dateTime: new Date().toString(),
              userAgent: userData.userAgent,
            });
            User.updateOne(
              { userName: userData.userName },
              { $set: { loginHistory: users[0].loginHistory } }
            )
              .exec()
              .then(() => {
                resolve(users[0]);
              })
              .catch((err) => {
                reject("There was an error verifying the user: err");
              });
          }
          else{
            reject("Incorrect Password for user: " + userData.userName);
          }
        });
          reject("Incorrect Password for user: " + userData.userName);
        }
        reject("Unable to find user: " + userData.userName);
      }).catch(err=>{
        reject("Unable to seacrh user: " + err);
      });
  });
};
