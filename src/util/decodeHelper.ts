import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

export const decodeHelper = (authorization: any): any => {
  const token: any = authorization.split('Bearer ')[1];

  let authResult;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      authResult = decode;
    }
  });

  return authResult;
};
