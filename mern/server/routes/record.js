const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the User.
recordRoutes.route("/record").get(function (req, res) {
 let db_connect = dbo.getDb("MernProject");
 db_connect
   .collection("User")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single record by id
recordRoutes.route("/record/:id").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect
   .collection("User")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
//Query 1:Users which have income lower than $5 USD and have a car of brand “BMW” or “Mercedes”.
recordRoutes.get('/record/users-low-income', async (req, res) => {
  const data = await db.collection('User').find({
    $and: [
      { income: { $lt: "$5" } },
      { car: { $in: ["BMW", "Mercedes"] } }
    ]
  }).toArray();
  res.json(data);
});

// Query 2: Male Users which have phone price greater than 10,000
recordRoutes.get('/record/male-users-high-phone-price', async (req, res) => {
  const data = await db.collection('User').find({
    $and: [
      { gender: "Male" },
      { phone_price: { $gt: "10000" } }
    ]
  }).toArray();
  res.json(data);
});

// Query 3: Users whose last name starts with “M” and has a quote character length greater than 15 and email includes his/her last name
recordRoutes.get('/record/users-lastname-quote-email', async (req, res) => {
  const data = await db.collection('User').find({
    $and: [
      { last_name: { $regex: /^M/i } },
      { $expr: { $gt: [ { $strLenCP: "$quote" }, 15 ] } },
      { $expr: { $regexMatch: { input: "$email", regex: { $concat: [".*", "$last_name", ".*"] }, options: "i" } } }
    ]
  }).toArray();
  res.json(data);
});

// Query 4: Users which have a car of brand “BMW”, “Mercedes” or “Audi” and whose email does not include any digit
recordRoutes.get('/record/users-car-email', async (req, res) => {
  const data = await db.collection('User').find({
    $and: [
      { car: { $in: ["BMW", "Mercedes", "Audi"] } },
      { email: { $not: { $regex: /\d/ } } }
    ]
  }).toArray();
  res.json(data);
});

// Query 5: Show the data of top 10 cities which have the highest number of users and their average income
recordRoutes.get('/record/top-cities', async (req, res) => {
  try {
    const result = await User.aggregate([
      { $group: { _id: '$address.city', count: { $sum: 1 }, total_income: { $sum: '$income' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { city: '$_id', count: 1, average_income: { $divide: ['$total_income', '$count'] }, _id: 0 } }
    ]);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
 
// // This section will help you create a new record.
// recordRoutes.route("/record/add").post(function (req, response) {
//  let db_connect = dbo.getDb();
//  let myobj = {
//    name: req.body.name,
//    position: req.body.position,
//    level: req.body.level,
//  };
//  db_connect.collection("User").insertOne(myobj, function (err, res) {
//    if (err) throw err;
//    response.json(res);
//  });
// });
 
// This section will help you update a record by id.
recordRoutes.route("/update/:id").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 let newvalues = {
   $set: {
     name: req.body.name,
     position: req.body.position,
     level: req.body.level,
   },
 };
 db_connect
   .collection("User")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     response.json(res);
   });
});
 
// This section will help you delete a record
recordRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect.collection("User").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});
 
module.exports = recordRoutes;