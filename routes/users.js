var express = require('express');
const router = express.Router();

const DBname = process.env.DB_NAME || 'drivegreen';
const DBhost = process.env.DB_HOST || '127.0.0.1';
const DBport = process.env.DB_PORT || '27017';

var express = require('express');
const mongoose = require("mongoose");

mongoose.connect(`mongodb://${DBhost}:${DBport}/${DBname}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connection Successful Products!");
  });
  

const UserSchema = mongoose.Schema({
    username: String,
    firstName:String,
    lastName:String,
    password:String,
    email:String,
    phone:String,
    // car:{
    //   registration: String,
    //   type: String
    // },
    status:Number,
    role:String
  });

  // compile schema to model,
const User = mongoose.model('User', UserSchema, 'User');

// router.post('/',(req,res)=>{
//       mongoose.model('User').findOne({username:req.body.username})
//       .then(function(customer){
//       if(customer) return  res.status(404).send("Already exists");
//       var customer = new User({
//         firstName: req.body.firstName, 
//         username:req.body.username,
//         password:req.body.password,
//         lastName:req.body.lastName,
//         email:req.body.email,
//         phone:req.body.phone,
//         car: {
//             registration: req.body.registration,
//             type: req.body.cartype
//         },
//         role:'user'
//        });

//         // save model to database
//         customer.save(function (err, p) {
//           if (err) return console.error(err);
//           console.log("Saved to  collection.");
//         });
       
//         res.send({customer});
//             })
   
// });
// router.post('/login', (req,res)=>{
//     mongoose.model('User').findOne({username:req.body.username,password:req.body.password})
//     .then(function(customer){
//     if(!customer) return  res.status(404).send("Bad username or password");
//     let status;
//     if(customer.status==1){
//        status=403;
//        return res.send({status});}
//     status=200;
//     res.send({customer,status});
//     })
//     .catch(function(err) {
//         // If an error occurred, send it to the client
//         res.json(err);
//       });;
// });

router.get('/',function (req, res) {
    var customer = new User({
    firstName: "Aleksandra", 
    username:'lexy',
    password:'1Keksileksi!',
    lastName:"Dimitrijevic",
    email:'ad.aleksandra.d@gmail.com',
    phone:'06490075645',
    // car: {
    //     registration: 'PK067OV',
    //     type: 'MECKA'
    // },
    role:'user'
    });

    // save model to database
    customer.save(function (err, p) {
        if (err) return console.error(err);
        console.log("Saved to  collection.");
    });
       
    res.send({success:"USERS CERATE"});
})

module.exports = router;