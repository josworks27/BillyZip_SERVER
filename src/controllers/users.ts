import { Request, Response } from 'express';
import { User } from '../entities/User';

// POST
// /users/signup
export const PostSignup = (req: Request, res: Response) => {
  // res.send('signUp success!');
  const {
    email,
    password,
    name,
    mobile,
    gender,
    birth,
    currentPlan,
    expiry,
    livingHouse
  } = req.body;

  console.log('User body is ', req.body);

  const newUser = new User();
  newUser.email = email;
  newUser.password = password;
  newUser.name = name;
  newUser.mobile = mobile;
  newUser.gender = gender;
  newUser.birth = birth;
  newUser.currentPlan = currentPlan;
  newUser.expiry = expiry;
  newUser.livingHouse = livingHouse;
  newUser.isActive = true;
  
  newUser.save();
  
  res.end();
};

// POST
// /users/signin
export const PostSignin = (req: Request, res: Response) => {
  res.send('signIn success!');
};

// GET
// /users/signout
export const GetSignout = (req: Request, res: Response) => {
  res.send('signOut success!');
};

// GET
// /users/:id/current-info
export const GetCurrentInfo = (req: Request, res: Response) => {
  res.send('GetCurrentInfo success!');
};

// GET
// /users/:id/list
export const GetList = (req: Request, res: Response) => {
  res.send('GetList success!');
};

// GET
// /users/:id/my-info
export const GetMyInfo = (req: Request, res: Response) => {
  res.send('GetMyInfo success!');
};

// PUT
// /users/:id/my-info
export const PutMyInfo = (req: Request, res: Response) => {
  res.send('PutMyInfo success!');
};
