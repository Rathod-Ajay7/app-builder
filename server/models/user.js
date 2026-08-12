import mongoose, { Schema } from 'mongoose'
import bcrypt from bcrypt

const userschema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
}, { timestamps: true });

//hash password before saving 
userschema.pre('save', async () => {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

//compare password

userschema.method.comparepassword = async function name(password) {
    return bcrypt.compare(password, this.password);
}

export const user = mongoose.model('User', userschema);

