const Sequelize=require('sequelize')
require('dotenv').config();
const sequelize=new Sequelize(process.env.DB_NAME,process.env.DB_USERNAME,process.env.DB_PASSWORD,{dialect:'mysql',host:process.env.DB_HOST,
    pool: {
        max: 5, 
        min: 0, 
        acquire: 30000, 
        idle: 10000, 
    },
    logging: console.log, 
    define: {
        timestamps: false, 
    },
});

module.exports=sequelize;