/*
import mongoose = require("mongoose"); //import mongoose
const Schema = mongoose.Schema;
import {dbconfig} from "../config/database";

const ProfileSchema = new Schema({
  loginId: {type: Schema.Types.ObjectId, required: true, unique: true, ref: 'logins'},
  emails: [{
    type: {type: String, required: false},
    email: {type: String, required: false}
  }],
  phones: [{
    type: {type: String, required: false},
    phone: {type: String, required: false}
  }],
  addresses: [{
    friendlyName: {type: String, required: false},
    address: {type: String, required: true},
    address2: {type: String, required: true},
    city: {type: String, required: false},
    state: {type: String, required: false},
    zip: {type: String, required: false}
  }],
  deleted: {type: Boolean, default: false}
});

//if you want audit fields
dbconfig.addAuditFields(ProfileSchema);

export const Profile = mongoose.model('Profile', ProfileSchema);
*/
