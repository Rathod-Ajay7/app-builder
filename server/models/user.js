import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

const userschema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
}, { timestamps: true });

//hash password before saving 
userschema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

//compare password
userschema.methods.comparepassword = async function (password) {
    return bcrypt.compare(password, this.password);
}

export const User = mongoose.model('User', userschema);
export const user = User;
