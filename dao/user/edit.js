const User = require("../../model/user");

const conn = require("../../config/mysql_conn_handler");

module.exports.editUser = (user) => {
  return new Promise((resolve, reject) => {
    if (!user instanceof User) {
      reject("Wrong object");
    }

    const query =
      "UPDATE `user` SET `u_fullname`=?, `u_username`=?, `u_email`=?, `u_balance`=? WHERE `u_uid` = ? AND `u_is_deleted` = 0;";
    conn.query(
      query,
      [
        user.fullname,
        user.username,
        user.email,
        user.balance,
        user.uid,
      ],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      },
    );
  });
};
