import * as twilio from 'twilio';

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);
const tempAuthObj: { [index: string]: number } = {};

const twilioHelper = {
  auth: async (userPhoneNum: string) => {
    const authNumber = Math.floor(Math.random() * 10000);

    try {
      if (!userPhoneNum) throw new Error('잘못된 휴대폰 번호입니다.');
      tempAuthObj[userPhoneNum] = authNumber;
      userPhoneNum = `+82${userPhoneNum.slice(1)}`;

      await client.messages.create({
        body: `BillyZip 회원가입 인증번호 ${authNumber}`,
        to: userPhoneNum,
        from: process.env.TWILIO_FROM,
      });
    } catch (err) {
      return err;
    }

    return tempAuthObj;
  },

  paymentMsg: async (userName: string, userPhoneNum: string) => {
    try {
      if (!userName) throw new Error('잘못된 유저 이름입니다.');
      if (!userPhoneNum) throw new Error('잘못된 휴대폰 번호 입니다.');

      const messaageResult = await client.messages.create({
        body: `${userName}님 요청하신 결제가 정상적으로 완료되었습니다. From BillyZip Team`,
        to: userPhoneNum,
        from: process.env.TWILIO_FROM,
      });

      const message = messaageResult;
      return message.sid;
    } catch (err) {
      return err;
    }
  },
};

export default twilioHelper;
