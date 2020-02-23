import { Request, Response } from 'express';
import { User } from '../entities/User';
import { getConnection, getRepository } from 'typeorm';
import { Payment } from '../entities/Payment';
import twilioHelper from '../util/twilioHelper';

// * POST
// * /payment
export const PostPayment = async (req: Request, res: Response) => {
  const { subscribePlan, paymentDate, paymentOption } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  try {
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        currentPlan: subscribePlan,
        expiry: () => 'expiry + 30',
      })
      .where('id = :id', { id: userId })
      .execute();

    const currentUser = await User.findOne({ id: userId });

    if (!currentUser) {
      res.status(404).json({ error: 'currentUser가 존재하지 않습니다.' });
      return;
    }

    const newPayment = new Payment();
    newPayment.user = currentUser;
    newPayment.subscribePlan = subscribePlan;
    newPayment.paymentDate = paymentDate;
    newPayment.paymentOption = paymentOption;
    newPayment.isActive = true;
    await newPayment.save();

    await twilioHelper.paymentMsg(
      currentUser.name,
      `+82${currentUser.mobile.slice(1)}`,
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /payment
export const GetPayment = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const payments = await getRepository(Payment)
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .where('payment.userId = :userId', { userId: userId })
      .orderBy('payment.created_at', 'DESC')
      .getMany();

    if (payments.length === 0) {
      res.status(404).json({ error: 'payments가 존재하지 않습니다.' });
      return;
    }

    res.status(200).json(payments);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
