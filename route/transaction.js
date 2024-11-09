const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const { authenticateToken, decoded_access } = require("../utils/jwt");
const { INCOMPLETE_BODY } = require("../constants/error_messages");
const makeId = require("../utils/random_string");

const router = express.Router();

// Add Transaction
router.post("/", authenticateToken, async (req, res) => {
  const { name, type, category, amount } = req.body;
  const cred = decoded_access(req.headers["authorization"]);
  if (!name || !type || !category || !amount) {
    res.status(400).send({
      success: false,
      error: INCOMPLETE_BODY,
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
      res.status(404).send({
        success: false,
        error: "User not found",
      });
      return;
    }
    if (type === "income") {
      user.u_balance += parseFloat(amount);
    } else if (type === "expense") {
      user.u_balance -= parseFloat(amount);
    } else {
      throw new Error("INVALID_TRANSACTION_TYPE");
    }

    await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_balance: user.u_balance,
      },
    });

    const result = await prisma.transaction.create({
      data: {
        t_uid: makeId(10),
        t_u_uid: cred.uid,
        t_name: name,
        t_type: type,
        t_category: category,
        t_amount: parseFloat(amount),
        t_is_deleted: false,
      },
    });

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

// Get All Transactions
router.get("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  try {
    const user = await prisma.user.findFirst({
      where: {
        u_uid: cred.uid,
        u_is_deleted: false,
      },
    });
    if (!user) {
      res.status(404).send({
        success: false,
        error: "User not found",
      });
      return;
    }
    const transactions = await prisma.transaction.findMany({
      where: {
        t_u_uid: cred.uid,
        t_is_deleted: false,
      },
    });

    transactions.forEach((transaction) => delete transaction.t_id);

    res.status(200).send({
      success: true,
      data: transactions,
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
