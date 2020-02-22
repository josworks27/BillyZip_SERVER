import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

export const decodeHelper = (authorization: string) => {
  const token: string = authorization.split('Bearer ')[1];

  let authResult;
  jwt.verify(token, jwtObj.secret, async (err, decode) => {
    if (decode) {
      authResult = decode;
    }
  });

  return authResult;
};
