const conn = require("../../config/mysql_conn_handler");
const {
  WRONG_OBJECT,
  EMAIL_NOT_FOUND,
} = require("../../constants/error_messages");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

module.exports.forgotPassword = (email) => {
  return new Promise((resolve, reject) => {
    if (!email) {
      return reject(WRONG_OBJECT);
    }

    const query = "SELECT * FROM `user` WHERE `u_email` = ?";
    conn.query(query, [email], (err, res) => {
      if (err || res.length === 0) {
        return reject(EMAIL_NOT_FOUND);
      }

      const token = crypto.randomBytes(20).toString("hex");
      const expiryTime = new Date(Date.now() + 3600000)
        .toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
        .replace(",", "")
        .replace(/:\d{2}\s/, " ")
        .replace(/\//g, "-")
        .split(" ")
        .map((part, index) =>
          index === 0 ? part.split("-").reverse().join("-") : part,
        )
        .join(" ");

      const query1 =
        "UPDATE `user` SET `u_resetPasswordToken` = ?, `u_resetPasswordExpires` = ? WHERE `u_email` = ?";
      conn.query(query1, [token, expiryTime, email], (err) => {
        if (err) {
          return reject(err);
        }

        // Send reset password email
        const transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "nandria.sapari7@gmail.com",
            pass: "fljn aodr wiye kqpt",
          },
        });

        const mailOptions = {
          to: email,
          from: process.env.EMAIL,
          subject: "Password Reset",
          text: `You are receiving this because you have requested a password reset. Please click the following link or paste it into your browser to complete the process:
            http://yourfrontendurl/reset-password/${token}`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            return reject("Email could not be sent." + error);
          }
          resolve("Password reset link sent to your email.");
        });
      });
    });
  });
};
