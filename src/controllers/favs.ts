import { Request, Response } from 'express';

// POST
// /favs
export const PostFavs = (req: Request, res: Response) => {
  res.send('PostFavs success!');
};

// GET
// /favs
export const GetFavs = (req: Request, res: Response) => {
    res.send('GetFavs success!');
  };