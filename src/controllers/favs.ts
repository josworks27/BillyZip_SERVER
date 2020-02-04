import { Request, Response } from 'express';
import { getConnection, Tree } from 'typeorm';
import { User } from '../entities/User';

// POST
// /favs
export const PostFavs = async (req: Request, res: Response) => {
  res.send('PostFavs success!');
  // console.log('req.body is ', req.body);

  // 아래 방법이 Insert할 때 가장 효율적인 방법이다.(대량 삽입)
  // const result = await getConnection()
  //   .createQueryBuilder()
  //   .insert()
  //   .into(User)
  //   .values([
  //     {
  //       firstName: req.body.firstName,
  //       lastName: req.body.lastName,
  //       age: req.body.age,
  //     },
  //   ])
  //   .execute();

  // res.json(result);
  // res.end();
};

// GET
// /favs
export const GetFavs = async (req: Request, res: Response) => {
  // way 1
  // const result = await getRepository(User).find();
  // res.json(result);

  // way 2
  // const result = await getConnection().manager.find(User);
  // res.json(result);

  // way 3, best way: use queryBuilder
  // const result = await getConnection()
  //   .createQueryBuilder()
  //   .select('user')
  //   .from(User, 'user')
  //   .where('user.id = :id', { id: 2 })
  //   .getOne();

  const user = new User();
  user.email = 'test@test.com';
  user.password = 'user.1234';
  user.name = 'user.name';
  user.mobile = '010-1234-1234';
  user.gender = 'man';
  user.birth = '1999-12-31';
  user.currentPlan = '100';
  user.expiry = '2020-03-20';
  user.livingHouse = 1;
  user.isActive = true;
  const userResult = await user.save();

  res.json(userResult);
};
