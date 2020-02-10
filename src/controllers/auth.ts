import { Request, Response } from 'express';
import * as twilio from 'twilio';

// twilio setting
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);

// ! 임시객체로 유저 전화번호와 인증번호를 저장
// ! 유저 전화번호로 요청이 오면 임시객체로 인증번호와 유저 전화번호를 비교하는데 사용
const tempAuthObj: { [index: string]: number } = {};

// Generate a random number
const authNumber = Math.floor(Math.random() * 10000);

// * POST
// * /auth
export const postAuth = (req: Request, res: Response) => {
  // 유저가 인증번호를 요청할 때의 로직
  // POST로 유저의 핸드폰 번호를 받으면 해당 번호로 인증번호를 보내준다.
  let { userPhoneNum } = req.body;

  // 유저 전화번호와 인증번호를 임시로 저장
  tempAuthObj[userPhoneNum] = authNumber;
  console.log('tempAuthObj is ', tempAuthObj);

  if (userPhoneNum !== null) {
    userPhoneNum = `+82${userPhoneNum.slice(1)}`;

    const messaageResult = client.messages.create({
      body: `BillyZip 회원가입 인증번호 ${authNumber}`,
      to: userPhoneNum,
      from: process.env.TWILIO_FROM,
    });

    messaageResult.then((message) => {
      console.log(message.sid);
    });

    res.status(200).json('인증번호 전송 성공');
  } else {
    // 번호 입력안하고 인증번호 요청했을 떄
    res.sendStatus(400);
  }
};

// * POST
// * /auth/verify
export const postVerify = (req: Request, res: Response) => {
  // 유저가 서버로 부터 받은 인증번호를 적어서 POST로 다시 요청보낸다.
  // req.body로 받은 요청번호가 맞는지 확인한다.
  const { userVerifyNum, userPhoneNum } = req.body;

  // 유저 전화번호와 인증번호를 임시로 저장
  if (tempAuthObj[userPhoneNum] === userVerifyNum) {
    // 맞을 때: 200 응답
    delete tempAuthObj[userPhoneNum];
    console.log(tempAuthObj);
    res.status(200).json('인증번호 일치');
  } else {
    // 아닐 때: 401 응답
    res.status(401).json('인증번호 불일치');
  }
};
