import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

const authHelper = (authorization: any): any => {
  const token: any = authorization.split('Bearer ')[1];

  let authResult;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (err) {
      authResult = { err: err };
    } else if (decode) {
      authResult = { decode: decode };
    }
  });

  return authResult;
};

export default authHelper;
