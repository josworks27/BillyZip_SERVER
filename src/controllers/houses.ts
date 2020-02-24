/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { House } from '../entities/House';
import { Amenity } from '../entities/Amenity';
import { User } from '../entities/User';
import { Image } from '../entities/Image';
import { Review } from '../entities/Review';
import { Favorite } from '../entities/Favorite';
import {
  createQueryBuilder,
  getRepository,
  getConnection,
  Not,
  LessThanOrEqual,
  Like,
} from 'typeorm';
import convertHouseProperties from '../util/convertHouseProperties';
import createAvgRatingHelper from '../util/avgRatingHelper';
import ratingRangeHelper from '../util/ratingRangeHelper';

// * POST
// * /houses
export const PostHouse = async (req: Request, res: Response) => {
  const {
    plan,
    type,
    year,
    access,
    status,
    display,
    startTime,
    endTime,
    location,
    adminDistrict,
    title,
    description,
    houseRule,
    secondFloor,
    parking,
    aircon,
    autoLock,
    tv,
    bed,
    washing,
    allowPet,
  } = req.body;

  const userId = Number(req.headers['x-userid-header']);

  try {
    const newAmenity = new Amenity();
    newAmenity.secondFloor = JSON.parse(secondFloor);
    newAmenity.parking = JSON.parse(parking);
    newAmenity.aircon = JSON.parse(aircon);
    newAmenity.autoLock = JSON.parse(autoLock);
    newAmenity.tv = JSON.parse(tv);
    newAmenity.bed = JSON.parse(bed);
    newAmenity.washing = JSON.parse(washing);
    newAmenity.allowPet = JSON.parse(allowPet);
    newAmenity.isActive = true;

    await newAmenity.save();

    const user = await User.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'user가 존재하지 않습니다.' });
      return;
    }

    const newHouse = new House();
    newHouse.plan = plan;
    newHouse.type = type;
    newHouse.year = year;
    newHouse.access = access;
    newHouse.status = JSON.parse(status);
    newHouse.display = JSON.parse(display);
    newHouse.startTime = startTime;
    newHouse.endTime = endTime;
    newHouse.location = JSON.parse(location);
    newHouse.adminDistrict = adminDistrict;
    newHouse.title = title;
    newHouse.description = description;
    newHouse.houseRule = houseRule;
    newHouse.isActive = true;
    newHouse.amenity = newAmenity;
    newHouse.user = user;
    await newHouse.save();

    for (let i = 0; i < req.files.length; i++) {
      const { originalname, location } = req.files[i];
      const imageName = originalname.split('.');

      if (imageName[0] === 'mainImg') {
        const newImage = new Image();
        newImage.filePath = location;
        newImage.fileName = originalname;
        newImage.house = newHouse;
        newImage.mainImage = true;
        newImage.isActive = true;
        await newImage.save();
      } else {
        const newImage = new Image();
        newImage.filePath = location;
        newImage.fileName = originalname;
        newImage.house = newHouse;
        newImage.mainImage = false;
        newImage.isActive = true;
        await newImage.save();
      }
    }

    res.status(200).json({ houseId: newHouse.id });
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /houses/all
export const GetAllHouses = async (req: Request, res: Response) => {
  try {
    const allHouses = await House.find();

    if (allHouses.length === 0) {
      res.status(404).json({ error: 'allHouses가 존재하지 않습니다.' });
      return;
    } else {
      res.status(200).json(allHouses);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /houses
export const GetMainHouses = async (req: Request, res: Response) => {
  try {
    const houses = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.reviews', 'review')
      .getMany();

    if (houses.length === 0) {
      res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
      return;
    }

    // * 각각의 매물의 리뷰 평균구하기
    const avgRating: { [index: number]: number } = {};

    for (let i = 0; i < houses.length; i++) {
      let avgTemp = 0;

      if (houses[i].reviews.length > 0) {
        for (let j = 0; j < houses[i].reviews.length; j++) {
          avgTemp += houses[i].reviews[j].rating;
        }
        avgRating[houses[i].id] = avgTemp / houses[i].reviews.length;
      } else {
        avgRating[houses[i].id] = 0;
      }
    }

    const sortArr = [];
    for (const prop in avgRating) {
      sortArr.push([prop, avgRating[prop]]);
    }
    sortArr.sort((a: any, b: any) => {
      return b[1] - a[1];
    });

    const overFourHouses = ratingRangeHelper.overFourHouses(sortArr);
    const rankHouses = [];

    if (overFourHouses.length > 3) {
      for (let i = 0; i < 4; i++) {
        const rankResult: House | undefined = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.reviews', 'review')
          .leftJoinAndSelect('house.images', 'image')
          .where('house.id = :id', { id: Number(overFourHouses[i][0]) })
          .getOne();

        if (!rankResult) {
          res.status(404).json({ error: 'rankResult가 존재하지 않습니다.' });
          return;
        }

        rankResult.avgRating = overFourHouses[i][1];
        rankHouses.push(rankResult);
      }
    } else {
      const overThreeHouses = ratingRangeHelper.overThreeUnderFourHouses(
        sortArr,
      );
      const threeConcatFour = overFourHouses.concat(overThreeHouses);

      for (let i = 0; i < 4; i++) {
        const rankResult: House | undefined = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.reviews', 'review')
          .leftJoinAndSelect('house.images', 'image')
          .where('house.id = :id', { id: Number(threeConcatFour[i][0]) })
          .getOne();

        if (!rankResult) {
          res.status(404).json({ error: 'rankResult가 존재하지 않습니다.' });
          return;
        }

        rankResult.avgRating = threeConcatFour[i][1];
        rankHouses.push(rankResult);
      }
    }

    // * 유형별 랜덤매물
    const houseType = ['apart', 'dandok', 'officetel', 'villa', 'oneroom'];
    const randHouses = [];

    for (let i = 0; i < houseType.length; i++) {
      const randResult = await createQueryBuilder(House, 'house')
        .leftJoinAndSelect('house.images', 'image')
        .take(4)
        .orderBy('RAND()')
        .where('house.type = :type', { type: houseType[i] })
        .getMany();

      if (randResult.length === 0) {
        res.status(404).json({ error: 'result가 존재하지 않습니다.' });
        return;
      }

      randHouses.push(randResult);
    }

    res.status(200).json({ rank: rankHouses, rand: randHouses });
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * POST
// * /houses/filter
export const PostFilterHouse = async (req: Request, res: Response) => {
  const { body } = req;
  const convertedType = convertHouseProperties(
    body.plan,
    body.type,
    body.year,
    body.access,
    body.adminDistrict,
  );
  const { plan, type, year, access, adminDistrict } = convertedType;

  try {
    const houses = await getRepository(House).find({
      relations: ['amenity', 'reviews', 'images'],
      where: {
        plan: plan ? plan : Not('null'),
        type: type ? type : Not('null'),
        year: year ? LessThanOrEqual(year) : Not('null'),
        access: access ? LessThanOrEqual(access) : Not('null'),
        adminDistrict: adminDistrict ? Like(`%${adminDistrict}%`) : Not('null'),
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    if (!houses) {
      res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
      return;
    }

    const avgRatingAddedHouses = createAvgRatingHelper.multiple(houses);

    res.status(200).json(avgRatingAddedHouses);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * POST
// * /houses/search
export const PostSearchHouse = async (req: Request, res: Response) => {
  if (req.body.searchWord) {
    const { searchWord } = req.body;
    const allSearchArray = [];

    // 각 요소를 TypeORM으로 쿼리하기 위해 where 조건을 만들고 allSearchArray에 담는다.
    allSearchArray.push(
      searchWord.split(' ').map((word: string) => {
        return { type: Like(`%${word}%`) };
      }),
    );
    allSearchArray.push(
      searchWord.split(' ').map((word: string) => {
        return { adminDistrict: Like(`%${word}%`) };
      }),
    );
    allSearchArray.push(
      searchWord.split(' ').map((word: string) => {
        return { title: Like(`%${word}%`) };
      }),
    );
    allSearchArray.push(
      searchWord.split(' ').map((word: string) => {
        return { description: Like(`%${word}%`) };
      }),
    );
    allSearchArray.push(
      searchWord.split(' ').map((word: string) => {
        return { houseRule: Like(`%${word}%`) };
      }),
    );

    console.log('all', allSearchArray);

    // ! 단어형, 문장형 분기
    if (searchWord.split(' ').length > 1) {
      // ! 문장형
      // ['부산', '해운대에', '있는', '뷰가', '좋은', '아파트']
      res.end();
    } else {
      // ! 단어형
      // ['부산']

      // 각 매물의 총점
      const housePoint: any = {};
      const temp = [];

      // 검색
      for (let i = 0; i < allSearchArray.length; i++) {
        const houses = await getRepository(House).find({
          where: allSearchArray[i],
        });

        temp.push(houses);

        if (houses.length > 0) {
          // 매물이 하나 이상일 때
          for (let j = 0; j < houses.length; j++) {
            // 가중치 3 요소
            if (
              allSearchArray[i][0].hasOwnProperty('type') ||
              allSearchArray[i][0].hasOwnProperty('adminDistrict')
            ) {
              if (housePoint.hasOwnProperty(houses[j].id)) {
                // housePoint에 id가 있을 때
                housePoint[houses[j].id] += 3;
              } else {
                // housePoint에 id가 없을 때
                housePoint[houses[j].id] = 3;
              }
            } else if (allSearchArray[i][0].hasOwnProperty('title')) {
              // 가중치 2 요소
              if (housePoint.hasOwnProperty(houses[j].id)) {
                // housePoint에 id가 있을 때
                housePoint[houses[j].id] += 2;
              } else {
                // housePoint에 id가 없을 때
                housePoint[houses[j].id] = 2;
              }
            } else if (
              allSearchArray[i][0].hasOwnProperty('description') ||
              allSearchArray[i][0].hasOwnProperty('houseRule')
            ) {
              // 가중치 1 요소
              if (housePoint.hasOwnProperty(houses[j].id)) {
                // housePoint에 id가 있을 때
                housePoint[houses[j].id] += 1;
              } else {
                // housePoint에 id가 없을 때
                housePoint[houses[j].id] = 1;
              }
            }
          }
        }
      }
      console.log('houses ??? ', temp);
      console.log('housePoint ??? ', housePoint);

      // ! housePoint 중 높은 순으로 반복문으로 다시 검색하고 조인하여 순서대로 배열에 푸시한다.
      // 높은 순으로 정렬
      const keysSorted = Object.keys(housePoint).sort(function(a, b) {
        return housePoint[b] - housePoint[a];
      });
      console.log('keysSorted', keysSorted);
      // [ '56', '19', '48' ]

      // 디비 검색
      const findedHouses = [];
      for (let i = 0; i < keysSorted.length; i++) {
        const house = await getRepository(House).findOne({
          relations: ['amenity', 'reviews', 'images'],
          where: [{ id: Number(keysSorted[i]) }],
        });
        findedHouses.push(house);
      }

      console.log(findedHouses);

      // 배열을 avgRatingHelper를 이용해 avgRating 추가

      const avgRatingAddedHouses = createAvgRatingHelper.multiple(findedHouses);

      res.status(200).json(avgRatingAddedHouses);
    }
  } else {
    res.status(400).json({ error: 'searchWord가 존재하지 않습니다.' });
    return;
  }
  // if (req.body.searchWord) {
  //   const { searchWord } = req.body;
  //   const searchWordArray = searchWord.split(' ');

  //   const convertedWords: string[] = searchWordArray.map((word: string) => {
  //     return { title: Like(`%${word}%`) };
  //   });

  //   try {
  //     const houses = await getRepository(House).find({
  //       relations: ['amenity', 'reviews', 'images'],
  //       where: convertedWords,
  //       order: {
  //         updatedAt: 'DESC',
  //       },
  //     });

  //     if (houses.length === 0) {
  //       res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
  //       return;
  //     }
  //     const avgRatingAddedHouses = createAvgRatingHelper.multiple(houses);

  //     res.status(200).json(avgRatingAddedHouses);
  //   } catch (err) {
  //     console.error('error is ', err);
  //     res.status(500).json({ error: err });
  //   }
  // } else {
  //   try {
  //     const houses = await getRepository(House).find({
  //       relations: ['amenity', 'reviews', 'images'],
  //       where: [],
  //       order: {
  //         updatedAt: 'DESC',
  //       },
  //     });

  //     if (houses.length === 0) {
  //       res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
  //       return;
  //     }

  //     res.status(200).json(houses);
  //   } catch (err) {
  //     console.error('error is ', err);
  //     res.status(500).json({ error: err });
  //   }
  // }
};

// * GET
// * /houses/part/:type
export const GetPartHouses = async (req: Request, res: Response) => {
  const { type } = req.params;

  try {
    const typeHouses = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.images', 'image')
      .leftJoinAndSelect('house.reviews', 'review')
      .where('house.type = :type', { type: type })
      .orderBy('house.updated_at', 'DESC')
      .getMany();

    if (typeHouses.length === 0) {
      res.status(404).json({ error: 'typeHouses가 존재하지 않습니다.' });
      return;
    }

    const avgRatingAddedHouses = createAvgRatingHelper.multiple(typeHouses);

    res.status(200).json(avgRatingAddedHouses);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * GET
// * /houses/:id
export const GetHouse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const house = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.images', 'image')
      .leftJoinAndSelect('house.amenity', 'amenity')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

    const reviews = await getRepository(Review)
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.houseId = :houseId', { houseId: house.id })
      .getMany();

    house['reviews'] = reviews;

    const avgRatingAddedHouses = createAvgRatingHelper.single(house);

    const fav = await getRepository(Favorite)
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', {
        userId: userId,
      })
      .andWhere('favorite.houseId = :houseId', { houseId: id })
      .getOne();

    const favsNow: boolean = fav ? true : false;
    avgRatingAddedHouses['favsNow'] = favsNow;

    res.status(200).json(avgRatingAddedHouses);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * PUT
// * /houses/:id
export const PutHouse = async (req: Request, res: Response) => {
  const {
    plan,
    type,
    year,
    access,
    status,
    display,
    startTime,
    endTime,
    location,
    adminDistrict,
    title,
    description,
    houseRule,
    secondFloor,
    parking,
    aircon,
    autoLock,
    tv,
    bed,
    washing,
    allowPet,
  } = req.body;

  const { id } = req.params;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const house = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

    if (house.user.id === userId) {
      await getConnection()
        .createQueryBuilder()
        .update(House)
        .set({
          plan: plan,
          type: type,
          year: year,
          access: access,
          status: JSON.parse(status),
          display: JSON.parse(display),
          startTime: startTime,
          endTime: endTime,
          location: JSON.parse(location),
          adminDistrict: adminDistrict,
          title: title,
          description: description,
          houseRule: houseRule,
        })
        .where('id = :id', { id: id })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .update(Amenity)
        .set({
          secondFloor: JSON.parse(secondFloor),
          parking: JSON.parse(parking),
          aircon: JSON.parse(aircon),
          autoLock: JSON.parse(autoLock),
          tv: JSON.parse(tv),
          bed: JSON.parse(bed),
          washing: JSON.parse(washing),
          allowPet: JSON.parse(allowPet),
        })
        .where('id = :id', { id: id })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Image)
        .where('house = :house', { house: house.id })
        .execute();

      const houseForImg = await House.findOne({ id: house.id });

      if (!houseForImg) {
        res.status(404).json({ error: 'houseForImg가 존재하지 않습니다.' });
        return;
      }

      for (let i = 0; i < req.files.length; i++) {
        const { originalname, location } = req.files[i];
        const imageName = originalname.split('.');

        if (imageName[0] === 'mainImg') {
          const newImage = new Image();
          newImage.filePath = location;
          newImage.fileName = originalname;
          newImage.house = houseForImg;
          newImage.mainImage = true;
          newImage.isActive = true;
          await newImage.save();
        } else {
          const newImage = new Image();
          newImage.filePath = location;
          newImage.fileName = originalname;
          newImage.house = houseForImg;
          newImage.mainImage = false;
          newImage.isActive = true;
          await newImage.save();
        }
      }

      res.status(200).json({ houseId: house.id });
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * DELETE
// * /houses/:id
export const DeleteHouse = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const house = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

    if (house.user.id === userId) {
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(House)
        .where('id = :id', { id: id })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Amenity)
        .where('id = :id', { id: id })
        .execute();

      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Review)
        .where('houseId = :houseId', { houseId: id })
        .execute();

      res.sendStatus(200);
    } else {
      res.sendStatus(401);
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
