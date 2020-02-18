import { Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite';
import { House } from '../entities/House';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';
import { Image } from '../entities/Image';
import { WSAEHOSTUNREACH, SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

// * POST
// * /favs
export const PostFavs = async (req: Request, res: Response) => {
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { houseId } = req.body;

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

        res.status(200).json(newFav);
      } else {
        // 중복이면 400번
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(404);
    }
  });
};

// * GET
// * /favs
export const GetFavs = async (req: Request, res: Response) => {
  // ! 토큰인증 !!!
  // 풋터에 있는 favs을 눌렀을 때 불러오는 로직
  // 토큰에 있는 user id로 favorite에 저장되어 있는 모든 데이터 house Join 해서 가져오기
  const bearerAuth: any = req.headers.authorization;
  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const favs: any = await getRepository(Favorite)
        .createQueryBuilder('favorite')
        .leftJoinAndSelect('favorite.user', 'user')
        .leftJoinAndSelect('favorite.house', 'house')
        .where('favorite.userId = :userId', { userId: decode.userId })
        .getMany();

        console.log(favs);

        // 서브쿼리가 대신 image 조인한 house로 favs의 house 대체
        for (let i = 0; i < favs.length; i++) {
          const house = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.images', 'image')
          .where('house.id = :id', { id: favs[i].house.id})
          .getOne();

          favs[i]['house'] = house;
        }
        
      res.status(200).json(favs);
    } else {
      res.sendStatus(404);
    }
  });
};

// * DELETE
// * /favs/:id
export const DeleteFavs = async (req: Request, res: Response) => {
  const { id } = req.params;
  const bearerAuth: any = req.headers.authorization;
  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const favResult = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Favorite)
        .where('favorite.houseId = :houseId', { houseId: id })
        .andWhere('favorite.userId = :userId', { userId: decode.userId })
        .execute();

      if (favResult.affected === 1) {
        res.status(200).json('정상적으로 제거');
      } else {
        res.sendStatus(404);
      }
    } else {
      res.sendStatus(401);
    }
  });
};
