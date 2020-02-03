import { Request, Response } from 'express';

// // POST
// // /houses
// export const PostNewHouse = (req: Request, res: Response) => {
//   res.send('PostNewHouse success!');
// };

// GET
// /houses
export const GetAllHouses = (req: Request, res: Response) => {
  res.send('GetAllHouse success!');
};

// POST
// /houses/search
export const PostSearchHouse = (req: Request, res: Response) => {
  res.send('PostSearchHouse success!');
};

// POST
// /houses/:id
export const PostHouse = (req: Request, res: Response) => {
  res.send('PostHouse success!');
};

// GET
// /houses/:id
export const GetHouse = (req: Request, res: Response) => {
  res.send('GetHouse success!');
};

// PUT
// /houses/:id
export const PutHouse = (req: Request, res: Response) => {
  res.send('PutHouse success!');
};

// DELETE
// /houses/:id
export const DeleteHouse = (req: Request, res: Response) => {
  res.send('DeleteHouse success!');
};
