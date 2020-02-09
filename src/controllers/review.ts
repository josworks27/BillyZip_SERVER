import { Request, Response } from 'express';
import { Review } from '../entities/Review';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import jwtObj from '../config/jwt';

// ! GET은 상세 매물 갖고 올 때 조인해서 응답하기!
// * POST
// * /houese/:id/comment
export const postReview = async (req: Request, res: Response) => {
  // req.params.id, req.body로 요청 확인 후 디비 처리
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      // ! tokenId는 나중에 토큰에 있는 유저아이디로 바꿀 것!!
      // const tokenId = 1;
      const id = Number(req.params.id);
      const { comment, rating } = req.body;

      // 토큰 id로 user 찾기
      let user;
      if (typeof decode.userId === 'number') {
        user = await User.findOne({ id: decode.userId });
      }

      if (user === undefined) {
        res.sendStatus(400);
        return;
      }

      // params id로 house 찾기
      let house;
      if (typeof id === 'number') {
        house = await House.findOne({ id: id });
      }

      if (house === undefined) {
        res.sendStatus(400);
        return;
      }

      // new review 생성
      const newReview = new Review();
      newReview.comment = comment;
      newReview.rating = rating;
      newReview.isActive = true;
      newReview.house = house;
      newReview.user = user;

      await newReview.save();

      res.json(newReview);
    } else {
      res.sendStatus(404);
    }
  });
};

// * PUT
// * /houses/:id/comment
export const putReview = async (req: Request, res: Response) => {
  // comment id, 수정할 comment, rating을 받는다.
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { commentId, comment, rating } = req.body;

      const putResult = await getConnection()
        .createQueryBuilder()
        .update(Review)
        .set({ comment: comment, rating: rating })
        .where('id = :id', { id: commentId })
        .execute();
      res.json(putResult);
    } else {
      res.sendStatus(404);
    }
  });
};

// * DELETE
// * /houses/:id/comment
export const deleteReview = async (req: Request, res: Response) => {
  // 삭제할 코멘트 아이디를 받는다.
  const bearerAuth: any = req.headers.authorization;

  const token = bearerAuth.split('Bearer ')[1];

  jwt.verify(token, jwtObj.secret, async (err: any, decode: any) => {
    if (decode) {
      const { commentId } = req.body;

      const deleteResult = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Review)
        .where('id = :id', { id: commentId })
        .execute();
      res.json(deleteResult);
    } else {
      res.sendStatus(404);
    }
  });
};
