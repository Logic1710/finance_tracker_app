const Transaction = require("../model/transacation");

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

//Error messages
const { INCOMPLETE_BODY } = require("../constants/error_messages");
const { addTransaction } = require("../dao/transaction/add");

const router = express.Router();

//add Transaction
router.post("/", authenticateToken, async (req, res) => {
  const { name, type, category, amount } = req.body;
  const cred = decoded_access(req.headers["authorization"]);
  if (
    name === undefined ||
    type === undefined ||
    category === undefined ||
    amount === undefined
  ) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
    });
    return;
  }

  const transaction = new Transaction(
    null,
    makeId(10),
    cred.uid,
    name,
    type,
    category,
    amount,
  );
  transaction.is_deleted = 0;

  addTransaction(transaction)
    .then((result) => {
      res.status(200).send({
        success: true,
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        success: false,
        error: err,
      });
    });
});

module.exports = router;
