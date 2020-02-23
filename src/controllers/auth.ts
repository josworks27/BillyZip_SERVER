import { Request, Response } from 'express';
import twilioHelper from '../util/twilioHelper';

// ! 임시객체로 유저 전화번호와 인증번호를 저장
// ! 유저 전화번호로 요청이 오면 임시객체로 인증번호와 유저 전화번호를 비교하는데 사용
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
  // 유저가 서버로 부터 받은 인증번호를 적어서 POST로 다시 요청보낸다.
  // req.body로 받은 요청번호가 맞는지 확인한다.

  const { userVerifyNum, userPhoneNum } = req.body;

  // 클라단 : userVerifyNum, userPhoneNum 데이터 모두 입력 했을 때,
  if (userVerifyNum !== undefined && userPhoneNum !== undefined) {
    // 유저 전화번호와 인증번호를 임시로 저장
    if (tempAuthObj[userPhoneNum] === Number(userVerifyNum)) {
      delete tempAuthObj[userPhoneNum];
      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } else {
    // 클라단 : userVerifyNum, userPhoneNum 데이터 둘 중 하나라도 입력하지 않을 때,
    // 클라단 : userPhoneNum 데이터를 입력하지 않은 경우
    if (userPhoneNum === undefined || userPhoneNum === '') {
      res.status(400).json('변경할 휴대폰 번호를 입력해주세요');
    } else if (userVerifyNum === undefined) {
      res.status(400).json('인증번호를 입력해주세요');
    } else {
      res.status(400).json('변경할 휴대폰 번호를 입력해주세요');
    }
  }
};
