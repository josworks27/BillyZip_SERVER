import { Request, Response } from 'express';
import { Review } from '../entities/Review';
import { User } from '../entities/User';
import { House } from '../entities/House';
import { getConnection } from 'typeorm';

// * POST
// * /house/:id/review
export const postReview = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { comment, rating } = req.body;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      res.status(404).json({ error: 'user가 존재하지 않습니다.' });
      return;
    }

    const house = await House.findOne({ id: Number(id) });
    if (!house) {
      res.status(404).json({ error: 'house가 존재하지 않습니다.' });
      return;
    }

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

// // * PUT
// // * /houses/:id/review
// export const putReview = async (req: Request, res: Response) => {
//   const { commentId, comment, rating } = req.body;

//   try {
//     const putResult = await getConnection()
//       .createQueryBuilder()
//       .update(Review)
//       .set({ comment: comment, rating: rating })
//       .where('id = :id', { id: commentId })
//       .execute();

//     res.status(200).json(putResult);
//   } catch (err) {
//     console.error('error is ', err);
//     res.status(500).json({ error: err });
//   }
// };

// * DELETE
// * /houses/:id/review/:reviewId
export const deleteReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const userId = Number(req.headers['x-userid-header']);

  try {
    const deleteResult = await getConnection()
      .createQueryBuilder()
      .delete()
      .from(Review)
      .where('id = :id', { id: reviewId })
      .andWhere('userId = :userId', { userId: userId })
      .execute();

    if (deleteResult.affected === 1) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: '해당하는 리뷰가 존재하지 않습니다.' });
    }
  } catch (err) {
    console.error('error is ', err);
    res.status(500).json({ error: err });
  }
};
