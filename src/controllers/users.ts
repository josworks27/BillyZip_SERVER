import { Request, Response } from 'express';


// POST
// users/signup
export const PostSignup = (req: Request, res: Response) => {
  res.send('signUp success!');
};

// POST
// users/signin
export const PostSignin = (req: Request, res: Response) => {
  res.send('signIn success!');
};

// GET
// users/signout
export const GetSignout = (req: Request, res: Response) => {
  res.send('signOut success!');
};

// GET
// users/:id/current-info
export const GetCurrentInfo = (req: Request, res: Response) => {
  res.send('GetCurrentInfo success!');
};

// GET
// users/:id/list
export const GetList = (req: Request, res: Response) => {
  res.send('GetList success!');
};

// GET
// users/:id/my-info
export const GetMyInfo = (req: Request, res: Response) => {
  res.send('GetMyInfo success!');
};

// PUT
// users/:id/my-info
export const PutMyInfo = (req: Request, res: Response) => {
  res.send('PutMyInfo success!');
};