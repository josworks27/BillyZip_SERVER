import { Request, Response } from 'express';
import { House } from '../entities/House';
import { Amenity } from '../entities/Amenity';
import { User } from '../entities/User';
import { Image } from '../entities/Image';
import { Review } from '../entities/Review';
import { createQueryBuilder, getRepository } from 'typeorm';

// * POST
// * /houses
export const PostHouse = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // 클라이언트에서 필요한 정보를 입력받아 요청하면(Amenity & House)
  // 토큰에 있는 User ID, req.file(이미지), req.body(그 외)를 확인하여 DB에 생성하고 응답하기

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
  const user = await User.findOne({ id: 1 });

  // 타입 가드??: user가 undefined라면 400번 응답하고 종료.
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
  newHouse.images = [];
  newHouse.isActive = true;
  // 1:1 관계는 위에서 생성한 newAmenity를 newHouse.amenity에 넣어준다.
  newHouse.amenity = newAmenity;
  // User에서 토큰에 있는 id와 같은 애를 가져와서 넣는다.
  newHouse.user = user;

  // 반복문으로 여러장의 새로운 Image 생성하기
  for (let i = 0; i < req.files.length; i++) {
    const { filename, path } = req.files[i];
    const newImage = new Image();
    newImage.filePath = path;
    newImage.fileName = filename;
    newImage.isActive = true;
    await newImage.save();

    newHouse.images.push(newImage);
  }

  await newHouse.save();

  res.status(200).json(newHouse);
};

// * GET
// * /houses
export const GetMainHouses = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // * 메인페이지에 보여줄 매물들 응답하기
  // * Rating 높은 추천매물 4개, 각 유형별 랜덤 매물 4개씩(원룸, 아파트, 단독주택, 빌라, 오피스텔, 기타)

  // join 하는 방법 house에 reviews들 붙여서 가져오기
  // inner join으로 리뷰가 있는 하우스들만 가져온다.
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

  for(let i = 0; i < houseType.length; i++) {
    const result = await createQueryBuilder(House, 'house')
    .take(4)
    .orderBy('RAND()')
    .where('house.type = :type', { type: houseType[i] })
    .getMany();

    randHouses.push(result);
  }

  // ! 유형별 랜덤매물 완료
  // console.log(randHouses);

  res.status(200).json({rank: rankHouse, rand: randHouses});
};

// * POST
// * /houses/search
export const PostSearchHouse = async (req: Request, res: Response) => {
  res.send('PostSearchHouse success!');
  // ! 토큰 확인한다.
  // req.body로 검색 조건을 확인한다.
  // House 테이블에서 조건에 맞게 찾는다.
  // 나온 결과물들을 응답한다.
};

// * GET
// * /houses/part
export const GetPartHouses = async (req: Request, res: Response) => {
  // * 각 유형별 매물을 최신순으로 응답하기
  // ! 토큰 확인한다.
  res.send('GetPartHouses');
};

// * GET
// * /houses/:id
export const GetHouse = async (req: Request, res: Response) => {
  res.send('GetHouse success!');
  // ! 토큰 확인한다.
  // req.params.id로 해당 매물의 id를 확인한다.
  // DB에서 id로 해당 매물을 찾아서 응답한다.
};

// * PUT
// * /houses/:id
export const PutHouse = async (req: Request, res: Response) => {
  res.send('PutHouse success!');
  // ! 토큰 확인한다.
  // 토큰 내 User ID와 해당 매물의 작성자(userId)가 일치하는지 확인한다.
  // 요청받은 정보를 req.file과 req.body로 확인하고 DB를 수정한다.
};

// * DELETE
// * /houses/:id
export const DeleteHouse = async (req: Request, res: Response) => {
  res.send('DeleteHouse success!');
  // ! 토큰 확인한다.
  // 토큰 내 User ID와 해당 매물의 작성자(userId)가 일치하는지 확인한다.
  // req.params.id로 해당 매물을 DB에서 삭제한다.
};
