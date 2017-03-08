import { Response } from "express";
import { httpUtil } from "./http";
import * as _ from "lodash";

export const validateUtil = {
  validationError: (err: any, res: Response) => {
    if (err && err.message.indexOf("duplicate key") !== -1) {
      const re = /index:\s(.+)_1/ig;
      const field = re.exec(err.message);
      httpUtil.conflict(res, "Duplicate " + field[1] + ".");
      return;
    }

    if (err && err.name === "ValidationError") {
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
}
};
