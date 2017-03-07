import {Document} from "mongoose";

export interface IPersistedModel extends Document {
  _id: any;
  validate(callback?: Function);
  save(callback?: Function);
  delete(callback?: Function);
}
