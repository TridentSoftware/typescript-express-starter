import {Response} from "express";

export const httpUtil = {
  badRequest: (res: Response, type: string, message: string, errors: any = null) => {
    res.status(400);
    res.json({error: type, message: message, errors: errors});
    res.end();
  },
  conflict: (res: Response, message: string, errors: any = null) => {
    res.status(409);
    res.json({error: "Conflict", message: message, errors: errors});
    res.end();
  },
  notFound: (res: Response, message: string, errors: any = null) => {
    res.status(404);
    res.json({error: "NotFound", message: message});
    res.end();
  },
  unauthorized: (res: Response, message: string, errors: any = null) => {
    res.status(401);
    res.json({error: "Unauthorized", message: message, errors: errors});
    res.end();
  }
};
