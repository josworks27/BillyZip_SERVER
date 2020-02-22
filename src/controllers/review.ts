import { Request, Response } from 'express';
import { Review } from '../entities/Review';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection } from 'typeorm';
import { decodeHelper } from '../util/decodeHelper';

// ! GET은 상세 매물 갖고 올 때 조인해서 응답하기!
// * POST
// * /house/:id/comment
export const postReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  try {
    const decode = await decodeHelper(req.headers.authorization);
    // 토큰 id로 user 찾기
    const user = await User.findOne({ id: decode.userId });

    if (!user) {
      res.status(404).json({ error: 'user가 존재하지 않습니다.' });
      return;
    }

    // params id로 house 찾기
    const house = await House.findOne({ id: Number(id) });

    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
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

    res.status(200).json(newReview);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * PUT
// * /houses/:id/comment
export const putReview = async (req: Request, res: Response) => {
  const { commentId, comment, rating } = req.body;

  try {
    const putResult = await getConnection()
      .createQueryBuilder()
      .update(Review)
      .set({ comment: comment, rating: rating })
      .where('id = :id', { id: commentId })
      .execute();

    res.status(200).json(putResult);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};

// * DELETE
// * /houses/:id/comment
export const deleteReview = async (req: Request, res: Response) => {
  const { commentId } = req.body;

  if (!commentId) throw new Error('req.body에 문제가 있습니다.');

  try {
    const deleteResult = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Review)
      .where('id = :id', { id: commentId })
      .execute();

    res.status(200).json(deleteResult);
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
