import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import { Request, Response, NextFunction } from 'express';

export const authChecker = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split('Bearer ')[1];

    jwt.verify(token, jwtObj.secret, (err) => {
      if (err) {
        res.status(401).json({ error: 'Auth Error from authChecker' });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({ error: 'Auth Error from authChecker' });
  }
};