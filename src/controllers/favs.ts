import { Request, Response } from 'express';
import { getConnection, getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Favorite } from '../entities/Favorite';
import { House } from '../entities/House';
import createAvgRatingHelper from '../util/avgRatingHelper';
import authHelper from '../util/authHelper';

// * POST
// * /favs
export const PostFavs = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { houseId } = req.body;

    // 중복이 있는지 체크
    const result = await getRepository(Favorite)
      .createQueryBuilder('favorite')
      .where('favorite.houseId = :houseId', { houseId: houseId })
      .andWhere('favorite.userId = :userId', {
        userId: authResult.decode.userId,
      })
      .getOne();

    if (!result) {
      // 중복 없으면 생성
      // 해당 매물의 house 데이터를 가져온다.
      const house = await House.findOne({ id: houseId });
      // 해당 유저의 user 데이터를 가져온다.
      const user = await User.findOne({ id: authResult.decode.userId });

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
};

// * GET
// * /favs
export const GetFavs = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const favs: any = await getRepository(Favorite)
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.user', 'user')
      .leftJoinAndSelect('favorite.house', 'house')
      .where('favorite.userId = :userId', { userId: authResult.decode.userId })
      .getMany();

    // 서브쿼리가 대신 image 조인한 house로 favs의 house 대체
    for (let i = 0; i < favs.length; i++) {
      const house: any = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.images', 'image')
        .leftJoinAndSelect('house.reviews', 'review')
        .where('house.id = :id', { id: favs[i].house.id })
        .getOne();

      // avgRating 추가
      const avgRatingAddedHouse = createAvgRatingHelper.single(house);
      favs[i]['house'] = avgRatingAddedHouse;
    }

    res.status(200).json(favs);
  } else {
    res.sendStatus(404);
  }
};

// * DELETE
// * /favs/:id
export const DeleteFavs = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { id } = req.params;
    const favResult = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Favorite)
      .where('favorite.houseId = :houseId', { houseId: id })
      .andWhere('favorite.userId = :userId', {
        userId: authResult.decode.userId,
      })
      .execute();

    if (favResult.affected === 1) {
      res.status(200).json('정상적으로 제거');
    } else {
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(401);
  }
};
