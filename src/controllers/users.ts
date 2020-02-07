import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection, getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import * as bcrypt from 'bcrypt';

// POST
// /users/signup
// 회원가입 구현
export const PostSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, mobile, gender, birth } = req.body;

    const userEmail = await User.findOne({ email: email });
    const hashedPwd = await bcrypt.hash(password, 10);

    if (userEmail) {
      // User DB에 email이 있는 경우
      res.status(409).send('이미 가입된 이메일입니다');
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
      res.status(200).send('회원가입이 완료되었습니다');
    }
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// POST
// /users/signin
// 로그인 구현
// 이메일이 일치하지 않는경우, undefind
// 비밀번호가 일치하지 않는 경우, undefind
// 이메일, 비밀번호가 일치하는 경우, 이메일과 비밀번호
export const PostSignin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userEmail: any = await User.findOne({ email: email });
    const checkPwd = await bcrypt.compare(password, userEmail.password);

    if (userEmail) {
      // 사용자 이메일이 존재할 때,
      if (checkPwd) {
        // 사용자 비밀번호 일치할 때,
        const token = jwt.sign(
          {
            userId: userEmail.id,
            email: email,
          },
          jwtObj.secret,
          {
            expiresIn: '30m',
          },
        );
        res.cookie('user', token);
        console.log('token :: ', token);

        res.status(200).send({ token: token });
      } else {
        // 사용자 비밀번호 일치하지 않을 때,
        res.status(409).send('비밀번호가 일치하지 않아요');
      }
    } else {
      res.status(409).send('회원가입을 해주세요');
    }
  } catch (error) {
    res.status(404).send({ error: error.message });
  }
};

// GET
// /users/signout
export const GetSignout = (req: Request, res: Response) => {
  res.send('signOut success!');
};

// GET
// /users/:id/current-info
export const GetCurrentInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userInfo = await getConnection()
      .createQueryBuilder()
      .select(['user.currentPlan', 'user.livingHouse'])
      .from(User, 'user')
      .where('user.id =:id', { id: id })
      .getMany();
    res.json(userInfo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
// GET
// /users/:id/list
// house의 userId : 매물 등록 작성자의 고유한 아이디
// 매물리스트 가져오기 위해서 houseId === id
export const GetList = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hostingList = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'houses')
      .where('house.userId = :userId', { userId: id })
      .getMany();
    res.send(hostingList);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// GET
// /users/:id/my-info
export const GetMyInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      .where('user.id =:id', { id: id })
      .getOne();
    res.json(myInfo);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// PUT
// /users/:id/my-info
export const PutMyInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, gender, birth, email, mobile } = req.body;
    await getConnection()
      .createQueryBuilder()
      .update(User)
      .set({
        name: name,
        gender: gender,
        birth: birth,
        email: email,
        mobile: mobile,
      })
      .where('user.id =:id', { id: id })
      .execute();
    res.json('프로필 회원 정보가 수정되었습니다');
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
