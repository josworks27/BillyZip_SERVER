const convertHouseProperty = (
  plan: string | null,
  type: string | null,
  year: string | number | null,
  access: string | number | null,
  adminDistrict: string | null,
) => {
  if (plan === '전체') {
    plan = null;
  }

  if (type === '전체') {
    type = null;
  } else if (type === '원룸') {
    type = 'oneroom';
  } else if (type === '아파트') {
    type = 'apart';
  } else if (type === '빌라') {
    type = 'villa';
  } else if (type === '오피스텔') {
    type = 'officetel';
  } else if (type === '주택') {
    type = 'dandok';
  }

  if (year === '전체') {
    year = null;
  } else if (year === '1년 이내') {
    year = 1;
  } else if (year === '5년 이내') {
    year = 5;
  } else if (year === '10년 이내') {
    year = 10;
  } else if (year === '20년 이내') {
    year = 20;
  } else if (year === '30년 이내') {
    year = 30;
  }

  if (access === '전체') {
    access = null;
  } else if (access === '5분 이내') {
    access = 5;
  } else if (access === '10분 이내') {
    access = 10;
  } else if (access === '20분 이내') {
    access = 20;
  } else if (access === '30분 이내') {
    access = 30;
  } else if (access === '60분 이내') {
    access = 60;
  }

  return {
    plan: plan,
    type: type,
    year: year,
    access: access,
    adminDistrict: adminDistrict,
  };
};

export default convertHouseProperty;
