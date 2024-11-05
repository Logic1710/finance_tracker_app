const User = require("../model/user");

//utils
const makeId = require("../utils/random_string");
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
require("dotenv").config();

//library
const express = require("express");
const crypto = require("crypto-js");

//dao
const { addUser } = require("../dao/user/add");
const { getAllUsers } = require("../dao/user/get_all");
const { editUser } = require("../dao/user/edit");
const { deleteUser } = require("../dao/user/delete");
const { loginWithUsername, loginWithEmail } = require("../dao/user/login");
const { changePwd } = require("../dao/user/changePassword");
const {
  AUTHENTICATION_FAILED,
  INCOMPLETE_BODY,
  EMAIL_NOT_VALID,
} = require("../constants/error_messages");
const { forgotPassword } = require("../dao/user/forgotPassword");
const { resetPassword } = require("../dao/user/resetPassword");

const router = express.Router();

//add User
router.post("/", async (req, res) => {
  if (
    req.body.fullname === undefined ||
    req.body.username === undefined ||
    req.body.email === undefined ||
    req.body.password === undefined ||
    req.body.confpassword === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "Incomplete body",
    });
    return;
  }

  if (req.body.password !== req.body.confpassword) {
    res.status(400).send({
      success: false,
      error: "Password does not match",
    });
    return;
  }

  if (!validateInputFullname(req.body.fullname)) {
    res.status(400).send({
      success: false,
      error: "Fullname can only contain alphabets and spaces",
    });
    return;
  }

  if (!validateInputUsername(req.body.username)) {
    res.status(400).send({
      success: false,
      error: "Username can only contain alphanumeric characters",
    });
    return;
  }

  if (!validateInputPassword(req.body.password)) {
    res.status(400).send({
      success: false,
      error:
        "Password must be at least 8 characters long, contain at least one uppercase letter and one special character",
    });
    return;
  }

  if (!validateInputEmail(req.body.email)) {
    res.status(400).send({
      success: false,
      error: "Email is not valid",
    });
    return;
  }
  const password = req.body.password;
  const salt = makeId(6);
  const saltPlusPass = salt + password;
  const saltedPassword = crypto.SHA256(saltPlusPass).toString();

  const user = new User(
    null,
    makeId(8),
    req.body.fullname,
    req.body.username,
    req.body.email,
    req.body.balance,
  );
  user.salt = salt;
  user.password = saltedPassword;
  user.is_deleted = 0;

  addUser(user)
    .then(async (result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

//get user
router.get("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  getAllUsers(cred.uid)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

//edit user
router.put("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  if (
    req.body.fullname === undefined ||
    req.body.username === undefined ||
    req.body.email === undefined ||
    req.body.balance === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (!validateInputFullname(req.body.fullname)) {
    res.status(400).send({
      success: false,
      error: "Fullname can only contain alphabets and spaces",
    });
  }

  if (validateInputUsername(req.body.username)) {
    res.status(400).send({
      success: false,
      error: "Username can only contain alphanumeric characters",
    });
  }

  if (validateInputEmail(req.body.email)) {
    res.status(400).send({
      success: false,
      error: "Email is not valid",
    });
    return;
  }

  console.log(req.user);
  const user = new User(
    null,
    cred.uid,
    req.body.fullname,
    req.body.username,
    req.body.email,
    req.body.balance,
  );
  delete user.id;

  editUser(user)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({
        success: false,
        error: err,
      });
    });
});

//delete user
router.delete("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  deleteUser(cred.uid)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

//login
router.post("/login", async (req, res) => {
  if (validateInputEmail(req.body.emailorusername)) {
    loginWithEmail(req.body.emailorusername, req.body.password)
      .then((result) => {
        const payload = {
          uid: result.uid,
          email: result.email,
          fullname: result.fullname,
          username: result.username,
        };

        res.status(200).send({
          success: true,
          users: result,
          token: generateAccessToken(payload),
        });
      })
      .catch((e) => {
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
      });
  } else {
    loginWithUsername(req.body.emailorusername, req.body.password)
      .then((result) => {
        const payload = {
          uid: result.uid,
          email: result.email,
          fullname: result.fullname,
          username: result.username,
        };

        res.status(200).send({
          success: true,
          users: result,
          token: generateAccessToken(payload),
        });
      })
      .catch((e) => {
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
      });
  }
});

//change password
router.put("/changepassword", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  if (
    req.body.oldpassword === undefined ||
    req.body.newpassword === undefined ||
    req.body.confpassword === undefined
  ) {
    res.status(400).send({
      success: false,
      error: "INCOMPLETE_BODY",
    });
    return;
  }

  if (!validateInputPassword(req.body.newpassword)) {
    res.status(400).send({
      success: false,
      error:
        "Password must be at least 8 characters long, contain at least one uppercase letter and one special character",
    });
    return;
  }

  if (req.body.newpassword !== req.body.confpassword) {
    res.status(400).send({
      success: false,
      error: "PASSWORD_MISMATCH",
    });
    return;
  }

  changePwd(cred.uid, req.body.oldpassword, req.body.newpassword)
    .then((result) => {
      res.status(200).send({
        success: true,
        result: result,
      });
    })
    .catch((e) => {
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
    });
});

//logout
router.post("/logout", authenticateToken, async (req, res) => {
  res.status(200).send({
    success: true,
    message: "Logged out",
  });
});

//forgot password
router.post("/forgot-password", async (req, res) => {
  if (req.body.email === undefined) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
    });
    return;
  }
  if (!validateInputEmail(req.body.email)) {
    res.status(400).send({
      success: false,
      error: EMAIL_NOT_VALID,
    });
    return;
  }
  forgotPassword(req.body.email)
    .then((message) => {
      res.status(200).send({
        success: true,
        message: message,
      });
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send({
        success: false,
        error: e,
      });
    });
});

router.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const newpassword = req.body.newpassword;

  resetPassword(token, newpassword)
    .then((message) => {
      res.status(200).send(message);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

module.exports = router;
