const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports.generateAccessToken = (obj) => {
  return jwt.sign(obj, process.env.TOKEN_SECRET, { expiresIn: "6H" });
};

module.exports.decoded_access = (authHeader) => {
  const token = authHeader && authHeader.split(" ")[1];
  return jwt.verify(token, process.env.TOKEN_SECRET);
};
