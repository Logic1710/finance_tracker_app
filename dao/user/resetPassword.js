const conn = require("../../config/mysql_conn_handler");
const crypto = require("crypto-js");
const { INVALID_TOKEN } = require("../../constants/error_messages");

module.exports.resetPassword = (token, password) => {
  return new Promise((resolve, reject) => {
    // Check if the token is valid and not expired
    conn.query(
      "SELECT * FROM `user` WHERE u_resetPasswordToken = ? AND u_resetPasswordExpires > ?",
      [token, Date.now()],
      async (err, result) => {
        if (err || result.length === 0) {
          return reject(INVALID_TOKEN + err);
        }

        const salt = result[0].u_salt;
        const saltedPassword = salt + password;
        const hashedPassword = crypto.SHA256(saltedPassword).toString();

        console.log(salt);
        console.log(saltedPassword);
        console.log(hashedPassword);

        // Update the password and clear the reset token
        conn.query(
          "UPDATE `user` SET u_password = ?, u_resetPasswordToken = NULL, u_resetPasswordExpires = NULL WHERE u_id = ?",
          [hashedPassword, result[0].u_id],
          (error) => {
            if (error) {
              return reject("Failed to reset password." + error);
            }
            resolve("Password has been successfully reset.");
          },
        );
      },
    );
  });
};
