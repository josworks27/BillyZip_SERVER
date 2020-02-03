import { Request, Response } from 'express';

// POST
// /application
export const PostApplication = (req: Request, res: Response) => {
  res.send('PostApplication success!');
};

// GET
// /application
export const GetApplication = (req: Request, res: Response) => {
    res.send('GetApplication success!');
  };