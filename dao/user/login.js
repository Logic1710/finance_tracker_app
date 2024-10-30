const crypto = require("crypto-js");
const conn = require("../../config/mysql_conn_handler");
const Users = require("../../model/user");
const {AUTHENTICATION_FAILED} = require("../../constants/error_messages");

const authenticateUser = (identifier, password, identifierType) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM `user` WHERE `" + identifierType + "` = ? AND `u_is_deleted` = 0;";
    conn.query(query, [identifier], async (error, users) => {
      if (error) {
        return reject(error);
      }
      if (!Array.isArray(users) || users.length === 0) {
        return reject(AUTHENTICATION_FAILED);
      }
      const user = users[0];
      const saltedUsersInputPass = user.u_salt + password;
      const usersInputHashBrown = crypto.SHA256(saltedUsersInputPass).toString();
      if (usersInputHashBrown === user.u_password) {
        const User = new Users(
            null,
            user.u_uid,
            user.u_fullname,
            user.u_username,
            user.u_email,
            user.u_balance,
            null,
            null,
            user.u_created,
            user.u_last_modified,
            user.u_is_deleted,
        );
        delete User.id;
        delete User.salt;
        delete User.password;
        resolve(User);
      } else {
        reject("AUTHENTICATION_FAILED");
      }
    });
  });
};

module.exports.loginWithUsername = (username, password) => {
  return authenticateUser(username, password, 'u_username');
};

module.exports.loginWithEmail = (email, password) => {
  return authenticateUser(email, password, 'u_email');
};