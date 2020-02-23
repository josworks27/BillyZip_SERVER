import { Request, Response } from 'express';
import twilioHelper from '../util/twilioHelper';

let tempAuthObj: { [index: number]: number };

// * POST
// * /auth
export const postAuth = async (req: Request, res: Response) => {
  const { userPhoneNum } = req.body;

  try {
    tempAuthObj = await twilioHelper.auth(userPhoneNum);

    if (tempAuthObj instanceof Error) {
      res.status(500).json({ error: tempAuthObj.message });
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * POST
// * /auth/verify
export const postVerify = (req: Request, res: Response) => {
  const { userVerifyNum, userPhoneNum } = req.body;

  if (userVerifyNum !== undefined && userPhoneNum !== undefined) {
    if (tempAuthObj[userPhoneNum] === Number(userVerifyNum)) {
      delete tempAuthObj[userPhoneNum];
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } else {
    if (userPhoneNum === undefined || userPhoneNum === '') {
      res.status(400).json('변경할 휴대폰 번호를 입력해주세요');
    } else if (userVerifyNum === undefined) {
      res.status(400).json('인증번호를 입력해주세요');
    } else {
      res.status(400).json('변경할 휴대폰 번호를 입력해주세요');
    }
  }
};
