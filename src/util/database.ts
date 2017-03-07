import {Response} from "express";
import {httpUtil} from "./http";
import _ from "lodash";

export const dbUtil = {
    validationError: (err: any, res: Response) => {
        if (err) {
          console.log(err);
            let out = [];
            _.each(err.errors, (value)=>{
                out.push({
                    type: value.kind,
                    field: value.path,
                    message: value.message
                });
            });
            httpUtil.badRequest(res, err.name, err.message, out);
        }
    }
};
