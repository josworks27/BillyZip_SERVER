// 셔플 함수
function shuffle(a: any) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ratingRangeHelper = {
  overFourHouses: (houses: any) => {
    const overFourHouses = houses.filter((house: any) => {
      return house[1] >= 4;
    });

    const suffledHouses = shuffle(overFourHouses);
    return suffledHouses;
  },

  overThreeUnderFourHouses: (houses: any) => {
    const overThreeUnderFourHouses = houses.filter((house: any) => {
      return house[1] >= 3 && house[1] < 4;
    });

    const suffledHouses = shuffle(overThreeUnderFourHouses);
    return suffledHouses;
  },

  overTwoUnderThreeHouses: (houses: any) => {
    const overTwoUnderThreeHouses = houses.filter((house: any) => {
      return house[1] >= 2 && house[1] < 3;
    });

    const suffledHouses = shuffle(overTwoUnderThreeHouses);
    return suffledHouses;
  },
};

export default ratingRangeHelper;
