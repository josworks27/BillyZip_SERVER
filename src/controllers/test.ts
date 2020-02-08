import { Request, Response } from 'express';
import * as twilio from 'twilio';
import { ResourceGroups } from 'aws-sdk';

// twilio setting
const accountSid = 'AC33390249f55021dc817dc82143ea2170';
const authToken = 'fc0d1035f40c3a4c3e02811c4c1c90f9';

const client = twilio(accountSid, authToken);

// GET
// /test
export const getTest = (req: Request, res: Response) => {
  // 유저가 인증번호를 요청할 때의 로직
  // GET으로 요청을 받으면 유저의 핸드폰 번호로 인증번호를 보내준다.
  const messaageResult = client.messages.create({
    body: 'BillyZip 회원가입 인증번호 전송!!',
    to: '+821027441488', // Text this number
    from: '+17014017638', // From a valid Twilio number
  });

  messaageResult.then((message) => {
    console.log(message.sid);
  });

  res.end();
};

// POST
// /test
export const postTest = (req: Request, res: Response) => {
  // 인증번호를 확인한 유저가 POST 요청으로 인증번호를 보낸다.
  // req.body로 인증번호를 확인하고 대조작업을 한다 ?
  
  // if (인증번호가 맞을 경우) {
  // } else {
  // 인증번호가 맞지 않을 경우
  // }

  res.end();
};
