const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto-js");
const crypto1 = require("crypto");
require("dotenv").config();

const {
  validateInputEmail,
  validateInputPassword,
  validateInputUsername,
  validateInputFullname,
} = require("../utils/regexr");
const {
  authenticateToken,
  generateAccessToken,
  decoded_access,
} = require("../utils/jwt");
const makeId = require("../utils/random_string");
const {
  AUTHENTICATION_FAILED,
  INCOMPLETE_BODY,
  EMAIL_NOT_VALID,
} = require("../constants/error_messages");

const router = express.Router();

// Add User
router.post("/", async (req, res) => {
  const { fullname, username, email, newpassword, confpassword } = req.body;
  if (!fullname || !username || !email || !newpassword || !confpassword) {
    res.status(400).send({
      success: false,
      error: "Incomplete body",
    });
    return;
  }

  if (newpassword !== confpassword) {
    res.status(400).send({
      success: false,
      error: "Password does not match",
    });
    return;
  }

  if (!validateInputFullname(fullname)) {
    res.status(400).send({
      success: false,
      error: "Fullname can only contain alphabets and spaces",
    });
    return;
  }

  if (!validateInputUsername(username)) {
    res.status(400).send({
      success: false,
      error: "Username can only contain alphanumeric characters",
    });
    return;
  }

  if (!validateInputPassword(newpassword)) {
    res.status(400).send({
      success: false,
      error:
        "Password must be at least 8 characters long, contain at least one uppercase letter and one special character",
    });
    return;
  }

  if (!validateInputEmail(email)) {
    res.status(400).send({
      success: false,
      error: EMAIL_NOT_VALID,
    });
    return;
  }

  const salt = makeId(6);
  const saltedPassword = crypto.SHA256(salt + newpassword).toString();

  try {
    const user = await prisma.user.create({
      data: {
        u_uid: makeId(8),
        u_fullname: fullname,
        u_username: username,
        u_email: email,
        u_password: saltedPassword,
        u_salt: salt,
        u_is_deleted: false,
        u_balance: 0,
      },
    });

    res.status(200).send({
      success: true,
      result: user,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

// Get User
router.get("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  try {
    const user = await prisma.user.findFirst({
      where: {
        u_uid: cred.uid,
        u_is_deleted: false,
      },
    });

    delete user.u_password;
    delete user.u_salt;
    delete user.u_id;

    res.status(200).send({
      success: true,
      result: user,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

// Edit User
router.put("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  const { fullname, username, email, balance } = req.body;
  if (!fullname || !username || !email || balance === undefined) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (!validateInputFullname(fullname)) {
    res.status(400).send({
      success: false,
      error: "Fullname can only contain alphabets and spaces",
    });
    return;
  }

  if (!validateInputUsername(username)) {
    res.status(400).send({
      success: false,
      error: "Username can only contain alphanumeric characters",
    });
    return;
  }

  if (!validateInputEmail(email)) {
    res.status(400).send({
      success: false,
      error: "Email is not valid",
    });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_fullname: fullname,
        u_username: username,
        u_email: email,
        u_balance: parseFloat(balance),
      },
    });

    delete user.u_password;
    delete user.u_salt;
    delete user.u_id;

    res.status(200).send({
      success: true,
      result: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      error: err,
    });
  }
});

// Delete User
router.delete("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  try {
    await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_is_deleted: true,
      },
    });

    res.status(200).send({
      success: true,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { emailorusername, password } = req.body;
  if (!emailorusername || !password) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ u_email: emailorusername }, { u_username: emailorusername }],
        u_is_deleted: false,
      },
    });

    if (!user) {
      throw AUTHENTICATION_FAILED;
    }

    const saltedUsersInputPass = user.u_salt + password;
    const usersInputHashBrown = crypto.SHA256(saltedUsersInputPass).toString();

    if (usersInputHashBrown !== user.u_password) {
      throw AUTHENTICATION_FAILED;
    }

    const payload = {
      uid: user.u_uid,
      email: user.u_email,
      fullname: user.u_fullname,
      username: user.u_username,
    };

    delete user.u_password;
    delete user.u_salt;
    delete user.u_id;

    res.status(200).send({
      success: true,
      users: user,
      token: generateAccessToken(payload),
    });
  } catch (e) {
    if (e === AUTHENTICATION_FAILED) {
      res.status(401).send({
        success: false,
        error: AUTHENTICATION_FAILED,
      });
    } else {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    }
  }
});

// Change Password
router.put("/changepassword", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  const { oldpassword, newpassword, confpassword } = req.body;
  if (!oldpassword || !newpassword || !confpassword) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (!validateInputPassword(newpassword)) {
    res.status(400).send({
      success: false,
      error:
        "Password must be at least 8 characters long, contain at least one uppercase letter and one special character",
    });
    return;
  }

  if (newpassword !== confpassword) {
    res.status(400).send({
      success: false,
      error: "PASSWORD_MISMATCH",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        u_uid: cred.uid,
        u_is_deleted: false,
      },
    });

    if (!user) {
      throw AUTHENTICATION_FAILED;
    }

    const saltedOldPass = user.u_salt + oldpassword;
    const oldPassHash = crypto.SHA256(saltedOldPass).toString();

    if (oldPassHash !== user.u_password) {
      throw AUTHENTICATION_FAILED;
    }

    const saltedNewPass = user.u_salt + newpassword;
    const newPassHash = crypto.SHA256(saltedNewPass).toString();

    await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_password: newPassHash,
      },
    });

    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    if (e === AUTHENTICATION_FAILED) {
      res.status(401).send({
        success: false,
        error: AUTHENTICATION_FAILED,
      });
    } else {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    }
  }
});

// Logout
router.post("/logout", authenticateToken, async (req, res) => {
  res.status(200).send({
    success: true,
    message: "Logged out",
  });
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
    });
    return;
  }

  if (!validateInputEmail(email)) {
    res.status(400).send({
      success: false,
      error: EMAIL_NOT_VALID,
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        u_email: email,
      },
    });

    if (!user) {
      res.status(404).send({
        success: false,
        error: EMAIL_NOT_VALID,
      });
      return;
    }

    const token = crypto1.randomBytes(20).toString("hex");
    const expiryTime = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: {
        u_email: email,
      },
      data: {
        u_resetPasswordToken: token,
        u_resetPasswordExpires: expiryTime,
      },
    });

    // Send reset password email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      to: email,
      from: process.env.EMAIL,
      subject: "Password Reset",
      text: `This is your token its valid for 1 hour: ${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newpassword } = req.body;

  if (!newpassword) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        u_resetPasswordToken: token,
        u_resetPasswordExpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).send({
        success: false,
        error: "Token is invalid or has expired",
      });
      return;
    }

    const saltedNewPass = user.u_salt + newpassword;
    const newPassHash = crypto.SHA256(saltedNewPass).toString();

    await prisma.user.update({
      where: {
        u_uid: user.u_uid,
      },
      data: {
        u_password: newPassHash,
        u_resetPasswordToken: null,
        u_resetPasswordExpires: null,
      },
    });

    res.status(200).send({
      success: true,
      message: "Password has been reset successfully.",
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({
      success: false,
      error: e,
    });
  }
});

module.exports = router;
