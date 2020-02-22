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

    try {
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
        const house = await House.findOne({ id: houseId });
        if (!house) {
          res.status(404).json({ error: 'house가 존재하지 않습니다.' });
          return;
        }

        const user = await User.findOne({ id: authResult.decode.userId });
        if (!user) {
          res.status(404).json({ error: 'user가 존재하지 않습니다.' });
          return;
        }

        const newFav = new Favorite();
        newFav.user = user;
        newFav.house = house;
        newFav.isActive = true;
        await newFav.save();

        res.status(200).json(newFav);
      } else {
        res.status(409).json({ error: '이미 찜한 매물입니다.' });
      }
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /favs
export const GetFavs = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    try {
      const favs = await getRepository(Favorite)
        .createQueryBuilder('favorite')
        .leftJoinAndSelect('favorite.user', 'user')
        .leftJoinAndSelect('favorite.house', 'house')
        .where('favorite.userId = :userId', {
          userId: authResult.decode.userId,
        })
        .getMany();

      if (favs.length === 0) {
        res
          .status(404)
          .json({ error: 'favs이 존재하지 않습니다.' });
        return;
      }

      for (let i = 0; i < favs.length; i++) {
        const house = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.images', 'image')
          .leftJoinAndSelect('house.reviews', 'review')
          .where('house.id = :id', { id: favs[i].house.id })
          .getOne();

        if (!house) {
          res
            .status(404)
            .json({ error: 'house가 존재하지 않습니다.' });
          return;
        }

        // avgRating 추가
        const avgRatingAddedHouse = createAvgRatingHelper.single(house);
        favs[i]['house'] = avgRatingAddedHouse;
      }

      res.status(200).json(favs);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};

// * DELETE
// * /favs/:id
export const DeleteFavs = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { id } = req.params;
    try {
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
        res.sendStatus(200);
      } else {
        res.status(404).json({ error: '해당하는 favs이 존재하지 않습니다.' });
      }
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    res.sendStatus(401);
  }
};
