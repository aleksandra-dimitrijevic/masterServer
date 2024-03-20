
const jwt = require("jsonwebtoken");
const JWTsecret = process.env.JWT_SECRET || 'secret';

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({msg: "A token is required for authentication, please log in."});
  }
  try {
    const decoded = jwt.verify(token, JWTsecret);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send({msg: "Invalid Token, please log in."});
  }
  return next();
};

module.exports = verifyToken;