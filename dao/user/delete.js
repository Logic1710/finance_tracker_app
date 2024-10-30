const User = require("../../model/user");
const conn = require("../../config/mysql_conn_handler");

module.exports.deleteUser = (user) => {
  return new Promise((resolve, reject) => {
    if (!user instanceof User) {
      reject("WRONG_OBJECT");
    }

    const query = "UPDATE `user` SET `u_is_deleted`= TRUE WHERE `u_uid` = ?";
    conn.query(query, [user.uid], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};
