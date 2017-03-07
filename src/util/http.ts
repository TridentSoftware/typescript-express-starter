import {Response} from "express";

export const httpUtil = {
  badRequest: (res: Response, type: string, message: string, errors: any = null) => {
    res.status(400);
    res.send({error: type, message: message, errors: errors});
    res.end();
  },
  conflict: (res: Response, message: string, errors: any = null) => {
    res.status(409);
    res.send({error: "Conflict", message: message, errors: errors});
    res.end();
  },
  notFound: (res: Response, message: string, errors: any = null) => {
    res.status(404);
    res.send({error: "NotFound", message: message});
    res.end();
  },
  unauthorized: (res: Response, message: string, errors: any = null) => {
    res.status(401);
    res.send({error: "Unauthorized", message: message, errors: errors});
    res.end();
  }
};
