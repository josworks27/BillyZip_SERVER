import { Request, Response } from 'express';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection, getRepository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import * as bcrypt from 'bcrypt';
import authHelper from '../util/authHelper';

// POST
// /users/signup
// 회원가입 구현
// jwt verify 필요 없음
export const PostSignup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, mobile, gender, birth } = req.body;

    const userEmail = await User.findOne({ email: email });
    const hashedPwd = await bcrypt.hash(password, 10);

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
  } catch (error) {
    res.status(400).json({ error: error.message });

    // 예를 들어, 필수입력 부분 중에 하나라도 필수 입력을 하지 않고
    // 회원가입 시도 하면, catch가 에러를 잡아준다.
    // 사용자가 모바일 번호 작성하지 않고, 회원가입 시도할 경우
    // 클라이언트에서 넘어온 파라미터가 이상할 경우, 400 상태 코드
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

        res.status(200).json({ token: token, userId: userEmail.id, userName: userEmail.name });
      } else {
        // 사용자 비밀번호 일치하지 않을 때,
        res.status(401).json('비밀번호가 일치하지 않아요');
        // 로그인 실패, 상태 코드 401
      }
    } else {
      res.status(409).json('회원가입을 해주세요');
      // 로그인 실패, 상태 코드 401
    }
  } catch (error) {
    // 서버 내부 오류, 상태 코드 400
    // 웹 서버가 요청사항을 수행할 수 없을 경우
    res.status(400).json({ error: error.message });
  }
};

// GET

// /users/signout
// 현재 클라이언트 단에서 로그아웃 버튼 없음 : 추후 논의
export const GetSignout = (req: Request, res: Response) => {
  res.send('signOut success!');
};

// GET
// /users/current-info
// jwt verify 필요 : Bearer Authorization
export const GetCurrentInfo = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const userInfo = await getConnection()
        .createQueryBuilder()
        .select(['user.livingHouse'])
        .from(User, 'user')
        .where('user.id =:id', { id: authResult.decode.userId })
        .getMany();
      // console.log('userInfo :: ', userInfo);
      // 현재 구독 플랜이 없는 것이 곧 살고 있는 집이 없는 것이다
      // userInfo => []; // 빈 배열
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
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  } else {
    // 토큰 인증 실패
    res.sendStatus(401);
  }
};
// GET
// /users/list
// house의 userId : 매물 등록 작성자의 고유한 아이디
// 매물리스트 가져오기 위해서 houseId === id
// jwt verify 필요 : Bearer Authorization
export const GetList = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const houseList = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.user', 'houses')
        .where('house.userId = :userId', { userId: authResult.decode.userId })
        .getMany();

      res.send(houseList);
    } catch (error) {
      // userId의 매물 정보가 없을 경우
      res.status(404).json({ error: error.message });
    }
  } else {
    // 토큰 인증 실패
    res.sendStatus(401);
  }
};

// GET
// /users/my-info
// jwt verify 필요 : Bearer Authorization
export const GetMyInfo = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
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
        .where('user.id =:id', { id: authResult.decode.userId })
        .getOne();
      res.json(myInfo);
    } catch (error) {
      // 서버가 요청받은 리소스를 찾을 수 없는 상태 코드, 404
      res.status(404).json({ error: error.message });
    }
  } else {
    // 토큰 인증 실패
    res.sendStatus(401);
  }
};

// PUT
// /users/my-info
// jwt verify 필요 : Bearer Authorization
export const PutMyInfo = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const { name, gender, birth, password, email, mobile } = req.body;

      if (
        name === undefined ||
        gender === undefined ||
        gender === undefined ||
        password === undefined ||
        email === undefined ||
        mobile === undefined
      ) {
        res.status(400).json('변경할 내용을 입력하세요');
      } else {
        const hashedPwd = bcrypt.hashSync(password, 10);

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
          .where('user.id =:id', { id: authResult.decode.userId })
          .execute();

        res.status(200).json('비밀번호가 변경되었습니다');
      }
    } catch (error) {
      // user DB에 필수 입력 하지 않을 경우
      // 예를 들어, user.name을 값을 입력하지 않을 경우,
      // 클라이언트에서 넘어온 파라미터가 이상할 경우, 400 상태 코드
      res.status(400).json('변경할 비밀번호를 입력해주세요');
    }
  } else {
    // 토큰 인증 실패
    res.sendStatus(401);
  }
};

// PUT
// /auth/mobile
// jwt verify 필요 : Bearer Authorization
// 인증 번호 성공 - 휴대폰 번호 변경
export const PutMobile = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const { userPhoneNum } = req.body;
      await getConnection()
        .createQueryBuilder()
        .update(User)
        .set({
          mobile: userPhoneNum,
        })
        .where('user.id =:id', { id: authResult.decode.userId })
        .execute();

      res.status(200).json('휴대폰 번호가 변경되었습니다');
    } catch (error) {
      res.status(400).json('인증번호가 불일치합니다');
    }
  } else {
    // 토큰 인증 실패
    res.sendStatus(401);
  }
};
