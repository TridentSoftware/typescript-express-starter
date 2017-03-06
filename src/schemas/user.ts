import { Schema } from "mongoose";

export let userSchema: Schema = new Schema({
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  }
});
userSchema.pre("save", function(next) {
  //do something
  next();
});