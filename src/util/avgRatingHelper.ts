// house에 있는 review들의 평균 rating을 계산하고 house에 추가하여 리턴하는 함수
const createAvgRatingHelper = {
  // 하나의 house용
  single: (house: any) => {
    let avgRating = 0;
    if (house !== undefined && house.reviews.length > 0) {
      for (let i = 0; i < house.reviews.length; i++) {
        avgRating += house.reviews[i].rating;
      }
      avgRating = avgRating / house.reviews.length;
      house['avgRating'] = avgRating;
    } else {
      house['avgRating'] = 0;
    }

    return house;
  },

  // 다수의 house용
  multiple: (houses: any) => {
    let avgRating = 0;
    for (let i = 0; i < houses.length; i++) {
      if (houses[i].reviews.length > 0) {
        for (let j = 0; j < houses[i].reviews.length; j++) {
          avgRating += houses[i].reviews[j].rating;
        }
        avgRating = avgRating / houses[i].reviews.length;
        houses[i]['avgRating'] = avgRating;
      } else {
        houses[i]['avgRating'] = 0;
      }
    }

    return houses;
  },
};

export default createAvgRatingHelper;
