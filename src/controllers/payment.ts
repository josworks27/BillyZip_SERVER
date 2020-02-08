import { Request, Response } from 'express';

// POST
// /payment
export const PostPayment = (req: Request, res: Response) => {
  res.send('PostPayment success!');
};

// GET
// /favs
export const GetPayment = (req: Request, res: Response) => {
  res.send('GetPayment success!');
};
