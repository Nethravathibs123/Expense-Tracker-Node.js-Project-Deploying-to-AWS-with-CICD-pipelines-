
const Expense = require('../models/expense');
const Users = require('../models/user');
const sequelize = require('../util/database'); 
const AWS=require('aws-sdk');
const DownloadHistory = require('../models/downloadhistory');

function uploadToS3(data, filename) {
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_ACCESS_KEY = process.env.ACCESS_KEY;
    const IAM_USER_SECRET_KEY = process.env.SECRET_KEY;

    const s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_ACCESS_KEY,
        secretAccessKey: IAM_USER_SECRET_KEY,
    });

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if (err) {
              console.log('something went wrong', err);
                console.error('Error uploading to S3:', err);
                reject(err);
            } else {
              console.log('success', s3response);
                resolve(s3response.Location); 
            }
        });
    });
  }

  exports.getAllExpenses = async (req) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    const totalExpensesCount = await Expense.count({ where: { userId } });
    const expenses = await Expense.findAll({
      where: { userId },
      offset: startIndex,
      limit: limit,
    });
  
    return {
      expenses: expenses.map((expense) => expense.dataValues),
      totalCount: totalExpensesCount,
      hasPrevPage: page > 1,
      hasNextPage: endIndex < totalExpensesCount,
    };
  };
  
  exports.addExpense = async (userId, expenseData) => {
    const { amount, description, category } = expenseData;
  
    if (!amount || !description || !category) {
      throw new Error('All fields are required');
    }
  
    const t = await sequelize.transaction();
  
    try {
        const parsedAmount = parseFloat(amount);
      const newExpense = await Expense.create({
        amount:parsedAmount,
        description,
        category,
        userId,
      }, { transaction: t });
      const user = await Users.findByPk(userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }
  
      const totalExpense = parseFloat(user.totalExpense || 0) + parsedAmount;
      await user.update({ totalExpense }, { transaction: t });
  
      await t.commit();
  
      return newExpense; 
    } catch (error) {
      await t.rollback();
      throw error; 
    }
  };
  
  exports.updateExpense = async (expenseId, expenseData) => {
    const { amount, description, category } = expenseData;
  
    if (!amount || !description || !category) {
      throw new Error('All fields are required');
    }
  
    const t = await sequelize.transaction();
  
    try {
      const expense = await Expense.findByPk(expenseId, { transaction: t });
      if (!expense) {
        throw new Error('Expense not found');
      }
      const parsedAmount = parseFloat(amount);
      const previousAmount = parseFloat(expense.amount);
      expense.amount = parsedAmount;
      expense.description = description;
      expense.category = category;
      await expense.save({ transaction: t });
  
      const user = await Users.findByPk(expense.userId, { transaction: t });
      if (!user) {
        throw new Error('User not found');
      }
  
      const totalExpense = parseFloat(user.totalExpense) - previousAmount + parsedAmount;
      await user.update({ totalExpense }, { transaction: t });
  
      await t.commit();
  
      return expense;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };
  
  exports.deleteExpense = async (userId, expenseId) => {
    const t = await sequelize.transaction();
  
    try {
      const expense = await Expense.findByPk(expenseId, { transaction: t });
      if (!expense) {
        throw new Error('Expense not found.');
      }
  
      if (expense.userId !== userId) {
        throw new Error('Unauthorized to delete this expense.');
      }
  
      const user = await Users.findByPk(userId, { transaction: t });
      if (!user) {
        throw new Error('User not found.');
      }
  
      const totalExpense = parseFloat(user.totalExpense) - parseFloat(expense.amount);
    await user.update({ totalExpense }, { transaction: t });

    await expense.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback(); 
      throw error;
    }
  };
  
  exports.downloadExpense = async (userId) => {
    const t = await sequelize.transaction();
    try {
      const expenses = await Expense.findAll({ where: { userId: userId } });
      console.log('Expenses:', expenses);
      const stringifiedExpenses = JSON.stringify(expenses);
      const filename = `Expense_${new Date().toISOString()}.txt`;
      const fileURL = await uploadToS3(stringifiedExpenses, filename);
      console.log('File URL:', fileURL);
  
      if (!fileURL) {
        throw new Error("File URL not found after upload");
      }
  
      const downloadhistory = {
        link: fileURL,
        userId: userId,
      };
  
      const id = await DownloadHistory.create(downloadhistory, { transaction: t });
  
      if (id) {
        await t.commit();
      } else {
        await t.rollback();
      }
  
      return fileURL;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };
  
 