import { Request, Response } from 'express';
import * as twilio from 'twilio';
import { ResourceGroups } from 'aws-sdk';

// twilio setting
const accountSid = 'AC33390249f55021dc817dc82143ea2170';
const authToken = 'fc0d1035f40c3a4c3e02811c4c1c90f9';

const client = twilio(accountSid, authToken);

// GET
// /test
export const GetTest = async (req: Request, res: Response) => {
  client.messages
    .create({
      body: 'BillyZip 회원가입 인증번호 전송!!',
      to: '+821027441488', // Text this number
      from: '+17014017638', // From a valid Twilio number
    })
    .then((message) => {
      console.log(message.sid);
      // SM03c2de5a81354deb88c723e26d05eb78
      res.end();
    });
};
