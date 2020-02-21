import * as twilio from 'twilio';

// twilio setting
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);
const tempAuthObj: { [index: string]: number } = {};

const twilioHelper = {
  auth: (userPhoneNum: any) => {
    const authNumber = Math.floor(Math.random() * 10000);

    tempAuthObj[userPhoneNum] = authNumber;
    userPhoneNum = `+82${userPhoneNum.slice(1)}`;

    const messaageResult = client.messages.create({
      body: `BillyZip 회원가입 인증번호 ${authNumber}`,
      to: userPhoneNum,
      from: process.env.TWILIO_FROM,
    });

    messaageResult.then((message) => {
      console.log(message.sid);
    });

    return tempAuthObj;
  },

  paymentMsg: async (userName: any, userPhoneNum: any) => {
    const messaageResult = client.messages.create({
      body: `${userName}님 요청하신 결제가 정상적으로 완료되었습니다. From BillyZip Team`,
      to: userPhoneNum,
      from: process.env.TWILIO_FROM,
    });

    const message = await messaageResult;
    return message.sid;
  },
};

export default twilioHelper;
