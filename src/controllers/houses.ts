import { Request, Response } from 'express';
import { House } from '../entities/House';
import { Amenity } from '../entities/Amenity';
import { User } from '../entities/User';

// * GET
// * /houses
export const GetAllHouses = async (req: Request, res: Response) => {
  // ! 토큰 확인한다.
  // GET 요청을 받으면 토큰 확인 후 모든 매물을 응답해준다.

  // 디비에서 모든 하우스 매물 가져오기
  const houses = await House.find();
  console.log('houses is ', houses);
  res.status(200).json('GetAllHouse success!');
};

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
    allowPet
  } = req.body;

  // 새로운 Amenity 생성하기
  const newAmenity = new Amenity();
  newAmenity.secondFloor = secondFloor;
  newAmenity.parking = parking;
  newAmenity.aircon = aircon;
  newAmenity.autoLock = autoLock;
  newAmenity.tv = tv;
  newAmenity.bed = bed;
  newAmenity.washing = washing;
  newAmenity.allowPet = allowPet;

  await newAmenity.save();

  // 토큰에 있는 user id와 같은 유저를 찾는다.
  const user = await User.findOne({id: 1});

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
  newHouse.status = status;
  newHouse.display = display;
  newHouse.startTime = startTime;
  newHouse.endTime = endTime;
  newHouse.location = location;
  newHouse.adminDistrict = adminDistrict;
  newHouse.title = title;
  newHouse.description = description;
  newHouse.houseRule = houseRule;
  newHouse.isActive = true;
  // 1:1 관계는 위에서 생성한 newAmenity를 newHouse.amenity에 넣어준다.
  newHouse.amenity = newAmenity;
  // User에서 토큰에 있는 id와 같은 애를 가져와서 넣는다.
  newHouse.user = user;

  await newHouse.save();

  res.status(200).json(newHouse);
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

// * POST
// * /houses/search
export const PostSearchHouse = async (req: Request, res: Response) => {
  res.send('PostSearchHouse success!');
  // ! 토큰 확인한다.
  // req.body로 검색 조건을 확인한다.
  // House 테이블에서 조건에 맞게 찾는다.
  // 나온 결과물들을 응답한다.
};
