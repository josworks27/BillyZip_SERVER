interface JwtObj {
  secret: string;
}

const jwtObj = {} as JwtObj;

if (typeof process.env.JWT === 'string') {
  jwtObj.secret = process.env.JWT;
} else {
  console.log('process.env.JWT ERROR');
}

export default jwtObj;
