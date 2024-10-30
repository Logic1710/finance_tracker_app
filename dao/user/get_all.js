const User = require("../../model/user");
const conn = require("../../config/mysql_conn_handler");

//getAll
module.exports.getAllUsers = (keyword, limitStart, limitCount) => {
  return new Promise((resolve, reject) => {
    let query =
      "SELECT * FROM `user` WHERE u_is_deleted = 0";
    if (keyword !== undefined) {
      query += ` AND u_uid LIKE '%${keyword}%' OR u_fullname LIKE '%${keyword}%' `;
    }
    if (limitStart !== undefined && limitCount !== undefined) {
      query += ` LIMIT ${limitStart}, ${limitCount}`;
    }
    conn.query(query, [], async (err, res) => {
      if (err) {
        reject(err);
      } else {
        let users = [];
        for (let i = 0; i < res.length; i++) {
          const user = new User(
            null,
            res[i].u_uid,
            res[i].u_fullname,
            res[i].u_username,
            res[i].u_email,
            res[i].u_balance,
            null,
            null,
            res[i].u_created,
            res[i].res_last_modified,
            res[i].u_is_deleted,
          );

          delete user.id;
          delete user.password;
          delete user.salt;
          users.push(user);
        }

        const result = {
          users: users
        };
        resolve(result);
      }
    });
  });
};