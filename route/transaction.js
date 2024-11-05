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

//routes
const { addTransaction } = require("../dao/transaction/add");
const { editUser } = require("../dao/user/edit");
const { getAllUsers } = require("../dao/user/get_all");

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

  try {
    // Fetch the user to get the current balance
    const user = await getAllUsers(cred.uid);

    console.log(user.users[0].balance);

    // Update the user's balance based on the transaction type
    if (type === "income") {
      user.users[0].balance += parseFloat(amount);
    } else if (type === "expense") {
      user.users[0].balance -= parseFloat(amount);
    } else {
      throw new Error("INVALID_TRANSACTION_TYPE");
    }

    await editUser(user.users[0]);

    const result = await addTransaction(transaction);

    res.status(200).send({
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
