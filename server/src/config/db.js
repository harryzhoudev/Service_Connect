const mongoose = require('mongoose');

//Establishes connection to MongoDB using Mongoose
async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI is missing');
  //enforce schema model in querying
  mongoose.set('strictQuery', true);
  //enforce schema model in saving, fields that are not in schema will be ignored and removed before saving
  mongoose.set('strict', true);
  //Logs mongoose operations to the console for debugging
  mongoose.set('debug', true);
  //Runs validation on update operations to ensure data integrity (ex. types, required fields, min/max values)
  mongoose.set('runValidators', true);
  //Removes any user-provided query filters that are not in the schema to prevent injection attacks
  mongoose.set('sanitizeFilter', true);

  //connect to MongoDB
  await mongoose.connect(uri);
  console.log('MongoDB connected:', mongoose.connection.name);
}

module.exports = { connectDB };
