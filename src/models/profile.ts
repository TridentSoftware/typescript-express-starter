/*
import mongoose = require("mongoose"); //import mongoose
const Schema = mongoose.Schema;
import {dbUtil} from "../util/database";

const ProfileSchema = new Schema({
  loginId: {type: Schema.Types.ObjectId, required: true, unique: true, ref: "users"},
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
    address: {type: String, required: false},
    address2: {type: String, required: false},
    city: {type: String, required: false},
    state: {type: String, required: false},
    zip: {type: String, required: false}
  }],
  deleted: {type: Boolean, default: false}
});

//if you want audit fields
dbUtil.addAuditFields(ProfileSchema);

export const Profile = mongoose.model("Profile", ProfileSchema);
*/
