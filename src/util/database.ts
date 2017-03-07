import {Response} from "express";
import {httpUtil} from "./http";
import _ from "lodash";

export const dbUtil = {
  validationError: (err: any, res: Response) => {
    if (err) {
      if (err.message.indexOf("duplicate key") !== -1){
        const re = /index:\s(.+)_1/ig;
        const field = re.exec(err.message);
        httpUtil.conflict(res, "Duplicate " + field[1] + ".");
        return;
      }
      let out = [];
      if (err.errors) {
        _.each(err.errors, (value) => {
          out.push({
            type: value.kind,
            field: value.path,
            message: value.message
          });
        });
      }
      httpUtil.badRequest(res, err.name, err.message, out);
    }
  }
};
