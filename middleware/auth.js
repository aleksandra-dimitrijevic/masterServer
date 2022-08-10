const jwt = require("jsonwebtoken");
const JWTsecret = process.env.JWT_SECRET || 'secret';

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, JWTsecret);
    req.user = decoded;
  } catch (err) {
    console.log(err)
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;