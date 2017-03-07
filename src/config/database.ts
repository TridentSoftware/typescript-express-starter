import {Schema} from "mongoose";

class dbconfigClass {
  private auditFieldSchema= {
    createdOn: {type: Date, default: Date.now},
    updatedOn: {type: Date, default: Date.now},
    createdBy: {type: String},
    updatedBy: {type: String}
  };

  public connection: string = "mongodb://localhost:27017/expressts";
  public secret: string = "My super safe secret 12334$#@%";

  constructor(){

  }

  addAuditFields(schema: Schema) {
    schema.add(this.auditFieldSchema)
  }
}

export const dbconfig = new dbconfigClass();
