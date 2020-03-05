import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection, getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import saltRounds from '../config/bcrypt';
import * as bcrypt from 'bcrypt';

// * POST
// * /users/signup
export const PostSignup = async (req: Request, res: Response) => {
  const { email, password, name, mobile, gender, birth } = req.body;

  try {
    const userEmail = await User.findOne({ email: email });
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    if (userEmail) {
      res.status(409).json('이미 가입된 이메일입니다');
    } else {
      const user = new User();
      user.email = email;
      user.password = hashedPwd;
      user.name = name;
      user.mobile = mobile;
      user.gender = gender;
      user.birth = birth;
      user.expiry = 0;
      user.isActive = true;
      await user.save();
      res.status(200).json('회원가입이 완료되었습니다');
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * POST
// * /users/signin
export const PostSignin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userEmail = await getRepository(User)
      .createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.name'])
      .addSelect(['user.password'])
      .where('user.email = :email', { email: email })
      .getOne();

    if (userEmail) {
      const checkPwd = await bcrypt.compare(password, userEmail.password);

      if (checkPwd) {
        const token = jwt.sign(
          {
            userId: userEmail.id,
            email: email,
          },
          jwtObj.secret,
          {
            expiresIn: '360m',
          },
        );

        res.status(200).json({
          token: token,
          userId: userEmail.id,
          userName: userEmail.name,
        });
      } else {
        res.status(401).json('비밀번호가 일치하지 않아요');
      }
    } else {
      res.status(404).json('회원가입을 해주세요');
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// // * GET
// // * /users/signout
// export const GetSignout = (req: Request, res: Response) => {
//   res.send('signOut success!');
// };

// * GET
// * /users/current-info
export const GetCurrentInfo = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const userInfo = await getConnection()
      .createQueryBuilder()
      .select(['user'])
      .from(User, 'user')
      .where('user.id =:id', { id: userId })
      .getOne();

    if (!userInfo) {
      res.status(404).json({ error: 'userInfo가 존재하지 않습니다.' });
    } else {
      const userCurrnetPlan = userInfo.currentPlan;

      const livingHouse = await getConnection()
        .createQueryBuilder()
        .select(['house'])
        .from(House, 'house')
        .where('house.id =:id', { id: userInfo.livingHouse })
        .getMany();

      res
        .status(200)
        .json({ livingHouse: livingHouse, currentPlan: userCurrnetPlan });
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
// * GET
// * /users/list
export const GetList = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const houseList = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .leftJoinAndSelect('house.images', 'image')
      .where('house.userId = :userId', { userId: userId })
      .getMany();

    if (houseList.length === 0) {
      res.status(404).json({ error: 'houseList가 존재하지 않습니다.' });
    } else {
      res.status(200).json(houseList);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /users/my-info
export const GetMyInfo = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const myInfo = await getConnection()
      .createQueryBuilder()
      .select(['user.name', 'user.gender', 'user.birth', 'user.email'])
      .addSelect(['user.mobile', 'user.password'])
      .from(User, 'user')
      .where('user.id =:id', { id: userId })
      .getOne();

    if (!myInfo) {
      res.status(404).json({ error: 'myInfo가 존재하지 않습니다.' });
    } else {
      res.status(200).json(myInfo);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * PUT
// * /users/my-info
export const PutMyInfo = async (req: Request, res: Response) => {
  const { name, gender, birth, password, email, mobile } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  if (
    name === undefined ||
    gender === undefined ||
    birth === undefined ||
    password === undefined ||
    email === undefined ||
    mobile === undefined
  ) {
    res.sendStatus(400);
  } else {
    const hashedPwd = bcrypt.hashSync(password, saltRounds);

    try {
      await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({
          name: name,
          gender: gender,
          birth: birth,
          password: hashedPwd,
          email: email,
          mobile: mobile,
        })
        .where('user.id =:id', { id: userId })
        .execute();

      res.sendStatus(200);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  }
};

// * DELETE
// * users/my-info
export const DeleteMyInfo = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-userid-header']);

  try {
    const deletedMyInfo = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('user.id = :id', { id: userId })
      .execute();

    if (deletedMyInfo.affected === 1) {
      res.sendStatus(200);
    } else if (deletedMyInfo.affected === 0) {
      res.status(404).json({ error: '해당하는 유저가 존재하지 않습니다.' });
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * PUT
// * /users/mobile
export const PutMobile = async (req: Request, res: Response) => {
  const { userPhoneNum } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const PutUserInfo = await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        mobile: userPhoneNum,
      })
      .where('user.id =:id', { id: userId })
      .execute();

    if (PutUserInfo.raw.affectedRows === 0) {
      res.status(404).json({ error: '해당하는 유저가 존재하지 않습니다.' });
    } else {
      res.sendStatus(200);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
