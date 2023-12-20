// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  });
  
  // Hashing the password before saving it to the database
  userSchema.pre('save', async function(next) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      next();
    } catch (error) {
      next(error);
    }
  });
  
  // Method to compare passwords during login
  userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;