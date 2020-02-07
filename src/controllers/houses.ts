import { Request, Response } from 'express';
import { House } from '../entities/House';
import { Amenity } from '../entities/Amenity';
import { User } from '../entities/User';
import { Image } from '../entities/Image';
import { Review } from '../entities/Review';
import {
  createQueryBuilder,
  getRepository,
  Brackets,
  getConnection,
} from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

// * POST
// * /houses
export const PostHouse = async (req: Request, res: Response) => {
  const token = req.cookies.user;

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      console.log('decode is ?? ', decode);
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
      const user = await User.findOne({ id: decode.userId });

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
        const { filename, path } = req.files[i];
        const newImage = new Image();
        newImage.filePath = path;
        newImage.fileName = filename;
        newImage.house = newHouse;
        newImage.isActive = true;
        await newImage.save();
      }

      res.status(200).json(newHouse);
    } else {
      res.sendStatus(404);
    }
  });
};

// * GET
// * /houses
export const GetMainHouses = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // * 메인페이지에 보여줄 매물들 응답하기
  // * Rating 높은 추천매물 4개, 각 유형별 랜덤 매물 4개씩(원룸, 아파트, 단독주택, 빌라, 오피스텔, 기타)

  // join 하는 방법 house에 reviews들 붙여서 가져오기
  // inner join으로 리뷰가 있는 하우스들만 가져온다.
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const houses = await getRepository(House)
        .createQueryBuilder('house')
        .innerJoinAndSelect('house.reviews', 'review')
        .getMany();

      // console.log(houses);

      // * 각각의 매물의 리뷰 평균구하기
      // 각 house의 rating을 담을 객체 생성
      const temp: { [index: number]: number[] } = {};
      const avgObj: { [index: number]: number } = {};

      for (let i = 0; i < houses.length; i++) {
        temp[i] = [];
        for (let j = 0; j < houses[i].reviews.length; j++) {
          temp[i].push(houses[i].reviews[j].rating);
        }
        const leng = temp[i].length;
        avgObj[i + 1] = temp[i].reduce((a, b) => a + b) / leng;
      }

      // { '1': 3, '2': 3.5, '3': 2, '4': 2, '5': 2, '6': 2 }

      // 객체 내림차순으로 정렬
      // 정렬해서 4개만 필터링
      const sortArr = [];
      for (const prop in avgObj) {
        sortArr.push([prop, avgObj[prop]]);
      }
      sortArr.sort((a: any, b: any) => {
        return b[1] - a[1];
      });

      // [[ '2', 3.5 ], [ '1', 3 ], [ '3', 2 ], [ '4', 2 ], [ '5', 2 ], [ '6', 2 ]]

      const rankHouse: any = [];
      for (let i = 0; i < 4; i++) {
        rankHouse.push(await House.findOne({ id: Number(sortArr[i][0]) }));
      }

      // ! 추천매물 완료
      // console.log(rankHouse);

      // * 유형별 랜덤매물
      const houseType = ['apart', 'dandok', 'officetel', 'villa', 'oneroom'];
      const randHouses = [];

      for (let i = 0; i < houseType.length; i++) {
        const result = await createQueryBuilder(House, 'house')
          .take(4)
          .orderBy('RAND()')
          .where('house.type = :type', { type: houseType[i] })
          .getMany();

        randHouses.push(result);
      }

      // ! 유형별 랜덤매물 완료
      // console.log(randHouses);

      res.status(200).json({ rank: rankHouse, rand: randHouses });
    } else {
      res.sendStatus(404);
    }
  });
};

// * POST
// * /houses/search
export const PostSearchHouse = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // req.body로 검색 조건을 확인한다.
  // House 테이블에서 조건에 맞게 찾는다.
  // 나온 결과물들을 응답한다.

  // ! 지도검색과 기본검색은 필터링 조건은 같다는 가정
  // ! left join으로 일부분 맞으면 다 붙여서 매물 가져오기
  // 1. req.body로 필터링 조건을 확인한다.
  // 2. 필터링 조건에 따라 검색한다.
  // 필터링조건 : 행정구역명(adminDistrict), 구독모델(plan), 집 유형(type), 건축연도 - 몇년 이내(year) ?!, 역까지 접근시간 - 몇 분 이내(access), 어메너티들(...)

  // ! 필수조건은 반드시 입력해야 함
  /** 필수조건 andWhere
    plan,
    type,
    year,
    access,
    adminDistrict,
   */

  /** 추가조건 new Brackets(...)
    secondFloor,
    parking,
    aircon,
    autoLock,
    tv,
    bed,
    washing,
    allowPet,
    */
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const {
        plan,
        type,
        year,
        access,
        adminDistrict,
        secondFloor,
        parking,
        aircon,
        autoLock,
        tv,
        bed,
        washing,
        allowPet,
      } = req.body;

      let houses;
      if (
        secondFloor !== null ||
        parking !== null ||
        aircon !== null ||
        autoLock !== null ||
        tv !== null ||
        bed !== null ||
        washing !== null ||
        allowPet !== null
      ) {
        // 추가옵션이 있을 때(하나라도 true가 있다는 것)
        console.log('추가조건 있을 때 실행~');
        houses = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.amenity', 'amenity')
          .leftJoinAndSelect('house.images', 'image')
          // 필수조건 검색(모든 조건 맞아야 나옴)
          .where('house.plan = :plan', { plan: plan })
          .andWhere('house.type = :type', { type: type })
          .andWhere('house.year = :year', { year: year })
          .andWhere('house.access = :access', { access: access })
          .andWhere('house.adminDistrict = :adminDistrict', {
            adminDistrict: adminDistrict,
          })
          /**
           * 필수만 맞고 추가가 안맞으면 필수에 맞는 매물이 나온다(필수에 맞는 전체 다 나온다.)
           * 필수도 맞고 추가도 맞으면 추가에 맞는 매물만 나온다(추가 다 맞는 일부만 나온다.)
           */
          .andWhere(
            new Brackets((qb) => {
              qb.where('amenity.secondFloor = :secondFloor', {
                secondFloor: secondFloor,
              })
                .andWhere('amenity.parking = :parking', {
                  parking: parking,
                })
                .andWhere('amenity.aircon = :aircon', {
                  aircon: aircon,
                })
                .andWhere('amenity.autoLock = :autoLock', {
                  autoLock: autoLock,
                })
                .andWhere('amenity.tv = :tv', {
                  tv: tv,
                })
                .andWhere('amenity.bed = :bed', {
                  bed: bed,
                })
                .andWhere('amenity.washing = :washing', {
                  washing: washing,
                })
                .andWhere('amenity.allowPet = :allowPet', {
                  allowPet: allowPet,
                });
            }),
          )
          .getMany();
      } else {
        // 추가옵션이 없을 때(필수만 있을 때)
        // 필수옵션만 검색
        console.log('추가조건 없을 때 실행~');
        houses = await getRepository(House)
          .createQueryBuilder('house')
          .leftJoinAndSelect('house.amenity', 'amenity')
          .leftJoinAndSelect('house.images', 'image')
          // 필수조건 검색(모든 조건 맞아야 나옴)
          .where('house.plan = :plan', { plan: plan })
          .andWhere('house.type = :type', { type: type })
          .andWhere('house.year = :year', { year: year })
          .andWhere('house.access = :access', { access: access })
          .andWhere('house.adminDistrict = :adminDistrict', {
            adminDistrict: adminDistrict,
          })
          .getMany();
      }
      res.json(houses);
    } else {
      res.sendStatus(404);
    }
  });
};

// * GET
// * /houses/part/:type
export const GetPartHouses = async (req: Request, res: Response) => {
  // * 각 유형별 매물을 최신순으로 응답하기
  // ! 토큰 확인한다.
  // req.params.type으로 유형 확인
  // 유형으로 디비조회 및 updated_at 최신순 orderBy
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { type } = req.params;

      const typeHouses = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.images', 'image')
        .where('house.type = :type', { type: type })
        .orderBy('house.updated_at', 'DESC')
        .getMany();

      res.json(typeHouses);
    } else {
      res.sendStatus(404);
    }
  });
};

// * GET
// * /houses/:id
export const GetHouse = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // req.params.id로 해당 매물의 id를 확인한다.
  // DB에서 id로 해당 매물을 찾아서 응답한다.
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { id } = req.params;

      console.log(id);

      const house = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.images', 'image')
        .leftJoinAndSelect('house.reviews', 'review')
        .where('house.id = :id', { id: id })
        .getOne();

      res.json(house);
    } else {
      res.sendStatus(404);
    }
  });
};

// * PUT
// * /houses/:id
export const PutHouse = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // ! 이미지 수정기능은 ??
  // 토큰 내 User ID와 해당 매물의 작성자(userId)가 일치하는지 확인한다.
  // 요청받은 정보를 req.file과 req.body로 확인하고 DB를 수정한다.
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
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

      // ! 토큰 대신 임시 테스트용!
      // const tempTokenUserId = 1;

      // 매물의 작성자를 확인하기 위해 매물의 정보를 가져온다.
      const house: any = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.user', 'user')
        .where('house.id = :id', { id: id })
        .getOne();

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

        res.sendStatus(200);
      } else {
        // 수정할 권한 없음
        res.sendStatus(409);
      }
    } else {
      res.sendStatus(404);
    }
  });
  // 수정할 내용 받기 POST와 동일
};

// * DELETE
// * /houses/:id
export const DeleteHouse = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // 토큰 내 User ID와 해당 매물의 작성자(userId)가 일치하는지 확인한다.
  // req.params.id로 해당 매물을 DB에서 삭제한다.
  const token = req.cookies.user;
  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { id } = req.params;

      // ! 토큰 대신 임시 테스트용!
      // const tempTokenUserId = 1;

      // 매물의 작성자를 확인하기 위해 매물의 정보를 가져온다.
      const house: any = await getRepository(House)
        .createQueryBuilder('house')
        .leftJoinAndSelect('house.user', 'user')
        .where('house.id = :id', { id: id })
        .getOne();

      if (house.user.id === token.userId) {
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
        res.sendStatus(409);
      }
    } else {
      res.sendStatus(404);
    }
  });
};
