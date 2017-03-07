import {Document} from "mongoose";

export interface IPersistedModel extends Document {
  _id: any;
}
