const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Function to connect to MongoDB
const connectMongoose = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/passport_auth');
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// User Schema definition
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Pre-save hook to hash the password before saving to the database
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const hashedPassword = await bcrypt.hash(user.password, salt); // Hash the password
        user.password = hashedPassword;
        next();
    } catch (error) {
        return next(error);
    }
});

// Method to compare passwords
userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);

module.exports = {
    connectMongoose,
    User
};
