import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  profilePic:{ type: String, default: "" },
}, { timestamps: true });  // createdAt and updatedAt fields will be automatically added by Mongoose

//last login: { type: Date, default: Date.now } // Optional field to track last login time

const User = mongoose.model("User", userSchema);

export default User;