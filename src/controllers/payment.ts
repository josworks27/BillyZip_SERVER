import { Request, Response } from 'express';
import { User } from '../entities/User';
import { getConnection, getRepository } from 'typeorm';
import { Payment } from '../entities/Payment';
import authHelper from '../util/authHelper';
import twilioHelper from '../util/twilioHelper';

// * POST
// * /payment
export const PostPayment = async (req: Request, res: Response) => {
  // 클라이언트로 부터 결제정보 받아서 payment 디비에 저장
  // 필요한 정보: userId(with TOKEN) / subscribePlan / paymentDate / paymentOption

  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { subscribePlan, paymentDate, paymentOption } = req.body;
    const { userId } = authResult.decode;
    // ! 디비: user에 currentPlan 업데이트 하기 / payment에 위 정보 생성하기

    if (paymentOption === undefined) {
      res.sendStatus(400);
    }

    // currentPlan 업데이트 하기
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({ currentPlan: subscribePlan })
      .where('id = :id', { id: userId })
      .execute();

    // payment에 위 정보 생성하기
    const currentUser: any = await User.findOne({ id: userId });
    const newPayment: any = new Payment();
    newPayment.user = currentUser;
    newPayment.subscribePlan = subscribePlan;
    newPayment.paymentDate = paymentDate;
    newPayment.paymentOption = paymentOption;
    newPayment.isActive = true;
    await newPayment.save();

    // ! Twilio SMS로 유저 전화번호에 결제정보 보내주기
    await twilioHelper.paymentMsg(
      currentUser.name,
      `+82${currentUser.mobile.slice(1)}`,
    );

    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /payment
export const GetPayment = async (req: Request, res: Response) => {
  // 토큰으로 userId 확인해서 payment에서 해당 유저의 결제기록 응답하기

  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { userId } = authResult.decode;

    const payments: any = await getRepository(Payment)
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.userId = :userId', { userId: userId })
      .orderBy('payment.created_at', 'DESC')
      .getMany();

    res.status(200).json(payments);
  } else {
    res.sendStatus(401);
  }
};
