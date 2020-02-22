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
import { decodeHelper } from '../util/decodeHelper';
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

  try {
    const decode = await decodeHelper(req.headers.authorization);
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

    // ! 토큰에 있는 user id와 같은 유저를 찾는다.
    const user = await User.findOne({ id: decode.userId });
    if (!user) {
      res.status(404).json({ error: 'user가 존재하지 않습니다.' });
      return;
    }

    // 요청받은 정보로 새로운 House 생성하기
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

    // 반복문으로 여러장의 새로운 Image 생성하기
    for (let i = 0; i < req.files.length; i++) {
      const { originalname, location } = req.files[i];
      const imageName = originalname.split('.');

      if (imageName[0] === 'mainImg') {
        // 메인이미지 일 때
        const newImage = new Image();
        newImage.filePath = location;
        newImage.fileName = originalname;
        newImage.house = newHouse;
        newImage.mainImage = true;
        newImage.isActive = true;
        await newImage.save();
      } else {
        // 메인 이미지가 아닐 때
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
    const avgRating: any = {};

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

    // 객체 내림차순으로 정렬
    // 정렬해서 4개만 필터링
    const sortArr = [];
    for (const prop in avgRating) {
      sortArr.push([prop, avgRating[prop]]);
    }
    sortArr.sort((a: any, b: any) => {
      return b[1] - a[1];
    });

    // 점수대별 랜덤매물
    const overFourHouses = ratingRangeHelper.overFourHouses(sortArr);
    const rankHouses = [];

    if (overFourHouses.length > 3) {
      // 매물이 4개 이상일 때
      for (let i = 0; i < 4; i++) {
        const rankResult: any = await getRepository(House)
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
      // 매물이 4개 이하일 때
      const overThreeHouses = ratingRangeHelper.overThreeUnderFourHouses(
        sortArr,
      );
      const threeConcatFour = overFourHouses.concat(overThreeHouses);

      for (let i = 0; i < 4; i++) {
        const rankResult: any = await getRepository(House)
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

    // avgRating 추가하기
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
    const searchWordArray = searchWord.split(' ');

    const convertedWords: string[] = searchWordArray.map((word: string) => {
      return { title: Like(`%${word}%`) };
    });

    try {
      const houses = await getRepository(House).find({
        relations: ['amenity', 'reviews', 'images'],
        where: convertedWords,
        order: {
          updatedAt: 'DESC',
        },
      });

      if (houses.length === 0) {
        res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
        return;
      }
      // avgRating 추가하기
      const avgRatingAddedHouses = createAvgRatingHelper.multiple(houses);

      res.status(200).json(avgRatingAddedHouses);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  } else {
    try {
      const houses = await getRepository(House).find({
        relations: ['amenity', 'reviews', 'images'],
        where: [],
        order: {
          updatedAt: 'DESC',
        },
      });

      if (houses.length === 0) {
        res.status(404).json({ error: 'houses가 존재하지 않습니다.' });
        return;
      }

      res.status(200).json(houses);
    } catch (err) {
      console.error('error is ', err);
      res.status(500).json({ error: err });
    }
  }
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

    // avgRating 추가하기
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

  try {
    const decode = await decodeHelper(req.headers.authorization);
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

    // user 조인한 reviews 만들기
    const reviews = await getRepository(Review)
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.houseId = :houseId', { houseId: house.id })
      .getMany();

    house['reviews'] = reviews;

    // avgRating 추가하기
    const avgRatingAddedHouses = createAvgRatingHelper.single(house);

    // 이미 favs한 매물인지 확인하기 true, false
    const fav = await getRepository(Favorite)
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', {
        userId: decode.userId,
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
  // const images = req.files;
  // console.log('images is ', images);

  try {
    const decode = await decodeHelper(req.headers.authorization);
    const house = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

    if (house.user.id === decode.userId) {
      // 수정할 권한 있음
      await getConnection()
        .createQueryBuilder()
        .update(House)
        .set({
          plan: plan,
          type: type,
          year: year,
          access: access,
          status: status,
          display: display,
          startTime: startTime,
          endTime: endTime,
          location: location,
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
          secondFloor: secondFloor,
          parking: parking,
          aircon: aircon,
          autoLock: autoLock,
          tv: tv,
          bed: bed,
          washing: washing,
          allowPet: allowPet,
        })
        .where('id = :id', { id: id })
        .execute();

      // ! 이미지 수정
      // * image에서 houseId === id 전부 삭제
      // * image에 새로운 이미지들로 다시 생성하기
      // * image.house = id;

      res.sendStatus(200);
    } else {
      // 수정할 권한 없음
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

  try {
    const decode = await decodeHelper(req.headers.authorization);
    const house = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

    if (house.user.id === decode.userId) {
      // 매물 지우기
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(House)
        .where('id = :id', { id: id })
        .execute();

      // 어메너티 지우기
      await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Amenity)
        .where('id = :id', { id: id })
        .execute();

      // 리뷰도 지우기
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
