const conn = require("../../config/mysql_conn_handler");
const crypto = require("crypto-js");
const {AUTHENTICATION_FAILED} = require("../../constants/error_messages");

module.exports.changePwd = (uid, password, newPassword) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM `user` WHERE `u_uid` = ? AND `u_is_deleted` = 0;";
    conn.query(query, [uid], async (error, users) => {
      if (users.length === 0) {
        reject(AUTHENTICATION_FAILED);
      } else {
        const saltedUsersInputPass = users[0].u_salt + password;
        const usersInputHashBrown = crypto
          .SHA256(saltedUsersInputPass)
          .toString();
        if (usersInputHashBrown === users[0].u_password) {
          const saltedUsersInputPass = users[0].u_salt + newPassword;
          const usersInputHashBrown = crypto
            .SHA256(saltedUsersInputPass)
            .toString();
          const query = "UPDATE `user` SET `u_password`=? WHERE `u_uid` = ?";
          conn.query(query, [usersInputHashBrown, uid], (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        } else {
          reject(AUTHENTICATION_FAILED);
        }
      }
    });
  });
};
