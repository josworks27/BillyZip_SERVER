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
import authHelper from '../util/authHelper';
import ratingRangeHelper from '../util/ratingRangeHelper';

// * POST
// * /houses
export const PostHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
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

    // ! JSON.parse는 테스트 환경의 문제. 클라이언트와 타입 확인해서 고칠 것!
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
    const user = await User.findOne({ id: authResult.decode.userId });

    if (user === undefined) {
      res.sendStatus(400);
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
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /houses/all
export const GetAllHouses = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const allHouses = await House.find();
    res.status(200).json(allHouses);
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /houses
export const GetMainHouses = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const houses = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.reviews', 'review')
      .getMany();

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

    console.log('avg ', avgRating);

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

    const rankHouses: any = [];

    if (overFourHouses.length > 3) {
      // 매물이 4개 이상일 때
      for (let i = 0; i < 4; i++) {
        const rankResult: any = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.reviews', 'review')
          .leftJoinAndSelect('house.images', 'image')
          .where('house.id = :id', { id: Number(overFourHouses[i][0]) })
          .getOne();
        rankResult.avgRating = overFourHouses[i][1];
        rankHouses.push(rankResult);
      }
    } else {
      // 매물이 4개 이하일 때
      const overThreeHouses = ratingRangeHelper.overThreeUnderFourHouses(
        sortArr,
      );
      const threeConcatFour = overFourHouses.concat(overThreeHouses);
      console.log('콘캣 ? ', threeConcatFour);
      for (let i = 0; i < 4; i++) {
        const rankResult: any = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.reviews', 'review')
          .leftJoinAndSelect('house.images', 'image')
          .where('house.id = :id', { id: Number(threeConcatFour[i][0]) })
          .getOne();
        rankResult.avgRating = threeConcatFour[i][1];
        rankHouses.push(rankResult);
      }
    }

    // * 유형별 랜덤매물
    const houseType = ['apart', 'dandok', 'officetel', 'villa', 'oneroom'];
    const randHouses = [];

    for (let i = 0; i < houseType.length; i++) {
      const result = await createQueryBuilder(House, 'house')
        .leftJoinAndSelect('house.images', 'image')
        .take(4)
        .orderBy('RAND()')
        .where('house.type = :type', { type: houseType[i] })
        .getMany();

      randHouses.push(result);
    }

    res.status(200).json({ rank: rankHouses, rand: randHouses });
  } else {
    res.sendStatus(401);
  }
};

// * POST
// * /houses/filter
export const PostFilterHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const body = req.body;
    const convertedType = convertHouseProperties(
      body.plan,
      body.type,
      body.year,
      body.access,
      body.adminDistrict,
    );

    const { plan, type, year, access, adminDistrict } = convertedType;

    const houses: any = await getRepository(House).find({
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

    // avgRating 추가하기
    const avgRatingAddedHouses = createAvgRatingHelper.multiple(houses);

    res.status(200).json(avgRatingAddedHouses);
  } else {
    res.sendStatus(401);
  }
};

// * POST
// * /houses/search
export const PostSearchHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    if (req.body.searchWord) {
      const { searchWord } = req.body;
      const searchWordArray = searchWord.split(' ');
      console.log(searchWordArray);

      const convertedWords: string[] = searchWordArray.map((word: any) => {
        return { title: Like(`%${word}%`) };
      });

      const houses: any = await getRepository(House).find({
        relations: ['amenity', 'reviews', 'images'],
        where: convertedWords,
        order: {
          updatedAt: 'DESC',
        },
      });

      // avgRating 추가하기
      const avgRatingAddedHouses = createAvgRatingHelper.multiple(houses);

      res.status(200).json(avgRatingAddedHouses);
    } else {
      const houses: any = await getRepository(House).find({
        relations: ['amenity', 'reviews', 'images'],
        where: [],
        order: {
          updatedAt: 'DESC',
        },
      });

      res.status(200).json(houses);
    }
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /houses/part/:type
export const GetPartHouses = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { type } = req.params;

    const typeHouses: any = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.images', 'image')
      .leftJoinAndSelect('house.reviews', 'review')
      .where('house.type = :type', { type: type })
      .orderBy('house.updated_at', 'DESC')
      .getMany();

    // avgRating 추가하기
    const avgRatingAddedHouses = createAvgRatingHelper.multiple(typeHouses);

    res.status(200).json(avgRatingAddedHouses);
  } else {
    res.sendStatus(401);
  }
};

// * GET
// * /houses/:id
export const GetHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { id } = req.params;

    const house: any = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.images', 'image')
      .leftJoinAndSelect('house.amenity', 'amenity')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    // user 조인한 reviews 만들기
    const reviews: any = await getRepository(Review)
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.houseId = :houseId', { houseId: house.id })
      .getMany();

    house['reviews'] = reviews;

    // avgRating 추가하기
    const avgRatingAddedHouses = createAvgRatingHelper.single(house);

    // 이미 favs한 매물인지 확인하기 true, false
    const fav: any = await getRepository(Favorite)
      .createQueryBuilder('favorite')
      .where('favorite.userId = :userId', { userId: authResult.decode.userId })
      .andWhere('favorite.houseId = :houseId', { houseId: id })
      .getOne();

    const favsNow: boolean = fav ? true : false;
    avgRatingAddedHouses['favsNow'] = favsNow;

    res.status(200).json(avgRatingAddedHouses);
  } else {
    res.sendStatus(401);
  }
};

// * PUT
// * /houses/:id
export const PutHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
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

    const images = req.files;
    console.log('images is ', images);

    // 매물의 작성자를 확인하기 위해 매물의 정보를 가져온다.
    const house: any = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (house.user.id === authResult.decode.userId) {
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
  } else {
    res.sendStatus(401);
  }
};

// * DELETE
// * /houses/:id
export const DeleteHouse = async (req: Request, res: Response) => {
  const authResult = authHelper(req.headers.authorization);

  if (authResult.decode) {
    const { id } = req.params;

    // 매물의 작성자를 확인하기 위해 매물의 정보를 가져온다.
    const house: any = await getRepository(House)
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .where('house.id = :id', { id: id })
      .getOne();

    if (house.user.id === authResult.decode.userId) {
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
  } else {
    res.sendStatus(401);
  }
};
