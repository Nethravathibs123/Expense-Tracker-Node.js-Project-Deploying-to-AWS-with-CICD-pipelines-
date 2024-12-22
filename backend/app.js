
const path = require('path');
const fs=require('fs');
const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const sequelize = require ('./util/database');
const helmet=require('helmet');
const morgan = require('morgan');


const Users = require ('./models/user');
const Expense = require('./models/expense');
const Order=require('./models/order')
const ForgetPassword=require('./models/password')
const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense'); 
const premiumRoutes = require('./routes/purchase');
const passwordRoutes = require('./routes/password');
const downloadhistory=require('./models/downloadhistory')
const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),
{flag:'a'} )


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public', { maxAge: 0 }));
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://cdn.jsdelivr.net;");
    next();
});
app.use(morgan('combined', { stream: accessLogStream }));

app.use('/user', userRoutes); 
app.use('/expenses', expenseRoutes); 
app.use('/premium', premiumRoutes);
app.use('/password', passwordRoutes);  
app.use('/', (req, res) => {
    console.log("url" + req.url);
    console.log(path.join(__dirname, `public/${req.url}`));

    res.sendFile(path.join(__dirname, `public${req.url}`));
});

Users.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Order,{foreignKey:'userId'});
Order.belongsTo(Users,{foreignKey:"userId"})

Users.hasMany(ForgetPassword,{foreignKey:'userId'});
ForgetPassword.belongsTo(Users,{foreignKey:'userId'});

Users.hasMany(downloadhistory,{foreignKey:'userId'});
downloadhistory.belongsTo(Users,{foreignKey:"userId"});

//force : true
sequelize.sync()
.then(() => {
    app.listen(process.env.PORT,()=>{
        console.log("Database is on  And Server is listing on 3000");
    })
}).catch((err) => {
    console.log(err)
});
