import {Response} from "express";

export const httpUtil = {
  unauthorized: (res: Response, type: string, message: string, errors: any) => {
    res.status(401);
    res.send({error: type, message: message, errors: errors});
    res.end();
  },
  badRequest: (res: Response, type: string, message: string, errors: any) => {
    res.status(400);
    res.send({error: type, message: message, errors: errors});
    res.end();
  },
  notFound: (res: Response, message: string) => {
    res.status(404);
    res.send({error: 'NotFound', message: message});
    res.end();
  }
};
