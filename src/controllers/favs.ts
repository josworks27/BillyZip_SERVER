import { Request, Response } from 'express';
import { getConnection, Tree, getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite';
import { House } from '../entities/House';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

// POST
// /favs
export const PostFavs = async (req: Request, res: Response) => {
  // 매물페이지에서 favs 버튼을 눌렀을 때 추가되는 favs에 처리되는 로직
  // 어떤 유저가 어떤 매물을 눌렀는지

  // house id와 user id를 req.body와 토큰에서 확인한다.
  // 각 모델의 인스턴스를 Favorite에 넣어준다.
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { houseId } = req.body;
      // const tempTokenUserId = 1;

      // 중복이 있는지 체크
      const result = await getRepository(Favorite)
        .createQueryBuilder('favorite')
        .where('favorite.houseId = :houseId', { houseId: houseId })
        .andWhere('favorite.userId = :userId', { userId: decode.userId })
        .getOne();

      if (!result) {
        // 중복 없으면 생성
        // 해당 매물의 house 데이터를 가져온다.
        const house = await House.findOne({ id: houseId });
        // 해당 유저의 user 데이터를 가져온다.
        const user = await User.findOne({ id: decode.userId });

        const newFav = new Favorite();
        if (user !== undefined) {
          newFav.user = user;
        }
        if (house !== undefined) {
          newFav.house = house;
        }
        newFav.isActive = true;
        await newFav.save();

        res.json(newFav);
      } else {
        // 중복이면 400번
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(404);
    }
  });
};

// GET
// /favs
export const GetFavs = async (req: Request, res: Response) => {
  // ! 토큰인증 !!!
  // 풋터에 있는 favs을 눌렀을 때 불러오는 로직
  // 토큰에 있는 user id로 favorite에 저장되어 있는 모든 데이터 house Join 해서 가져오기
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      // const tempTokenUserId = 1;
      const favs = await getRepository(Favorite)
        .createQueryBuilder('favorite')
        .leftJoinAndSelect('favorite.user', 'user')
        .leftJoinAndSelect('favorite.house', 'house')
        .where('favorite.userId = :userId', { userId: decode.userId })
        .getMany();

      res.json(favs);
    } else {
      res.sendStatus(404);
    }
  });
};
