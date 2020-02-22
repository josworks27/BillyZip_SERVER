import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection, getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import saltRounds from '../config/bcrypt';
import * as bcrypt from 'bcrypt';
import { decodeHelper } from '../util/decodeHelper';

// * POST
// * /users/signup
export const PostSignup = async (req: Request, res: Response) => {
  const { email, password, name, mobile, gender, birth } = req.body;

  try {
    const userEmail = await User.findOne({ email: email });
    const hashedPwd = await bcrypt.hash(password, saltRounds);

    if (userEmail) {
      // User DB에 email이 있는 경우
      res.status(409).json('이미 가입된 이메일입니다');
      // 이미 가입된 이메일로 가입 시도시, 409
    } else {
      // User DB에 email이 없는 경우
      // 회원 가입 하기
      const user = new User();
      user.email = email;
      user.password = hashedPwd;
      user.name = name;
      user.mobile = mobile;
      user.gender = gender;
      user.isActive = true;
      user.birth = birth;
      // ! 아래 테스트용 임시
      user.expiry = 3;
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
// 로그인 구현
// 이메일이 일치하지 않는경우, undefind
// 비밀번호가 일치하지 않는 경우, undefind
// 이메일, 비밀번호가 일치하는 경우, 이메일과 비밀번호
export const PostSignin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userEmail = await User.findOne({ email: email });

    if (userEmail) {
      // 사용자 이메일이 존재할 때,
      const checkPwd = await bcrypt.compare(password, userEmail.password);

      if (checkPwd) {
        // 사용자 비밀번호 일치할 때,
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
        // 사용자 비밀번호 일치하지 않을 때,
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

// GET
// /users/signout
export const GetSignout = (req: Request, res: Response) => {
  res.send('signOut success!');
};

// GET
// /users/current-info
export const GetCurrentInfo = async (req: Request, res: Response) => {
  try {
    const decode = await decodeHelper(req.headers.authorization);
    const userInfo = await getConnection()
      .createQueryBuilder()
      .select(['user.livingHouse'])
      .from(User, 'user')
      .where('user.id =:id', { id: decode.userId })
      .getMany();

    if (userInfo.length === 0) {
      // 데이터가 없는 것이 정상일 수 있는 상황
      // 204 : No contents

      res.status(204).json(userInfo);
    } else {
      // 현재 구독 플랜 있다는 뜻은 살고 있는 집이 있다는 뜻
      const livingHouse = await getConnection()
        .createQueryBuilder()
        .select(['house'])
        .from(House, 'house')
        .where('house.id =:id', { id: userInfo[0].livingHouse })
        .getMany();

      res.status(200).json(livingHouse);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
// GET
// /users/list
// house의 userId : 매물 등록 작성자의 고유한 아이디
// 매물리스트 가져오기 위해서 houseId === id
export const GetList = async (req: Request, res: Response) => {
  try {
    const decode = await decodeHelper(req.headers.authorization);
    const houseList = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .leftJoinAndSelect('house.images', 'image')
      .where('house.userId = :userId', { userId: decode.userId })
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

// GET
// /users/my-info
export const GetMyInfo = async (req: Request, res: Response) => {
  try {
    const decode = await decodeHelper(req.headers.authorization);
    const myInfo = await getConnection()
      .createQueryBuilder()
      .select([
        'user.name',
        'user.gender',
        'user.birth',
        'user.email',
        'user.mobile',
        'user.password',
      ])
      .from(User, 'user')
      .where('user.id =:id', { id: decode.userId })
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

// PUT
// /users/my-info
export const PutMyInfo = async (req: Request, res: Response) => {
  const { name, gender, birth, password, email, mobile } = req.body;

  if (
    name === undefined ||
    gender === undefined ||
    gender === undefined ||
    password === undefined ||
    email === undefined ||
    mobile === undefined
  ) {
    res.sendStatus(400);
  } else {
    const hashedPwd = bcrypt.hashSync(password, saltRounds);

    try {
      const decode = await decodeHelper(req.headers.authorization);
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
        .where('user.id =:id', { id: decode.userId })
        .execute();

      res.sendStatus(200);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  }
};

// PUT
// /auth/mobile
export const PutMobile = async (req: Request, res: Response) => {
  const { userPhoneNum } = req.body;

  try {
    const decode = await decodeHelper(req.headers.authorization);
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        mobile: userPhoneNum,
      })
      .where('user.id =:id', { id: decode.userId })
      .execute();

    res.sendStatus(200);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
