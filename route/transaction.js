const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const { authenticateToken, decoded_access } = require("../utils/jwt");
const {
  INCOMPLETE_BODY,
  USER_NOT_FOUND,
  TRANSACTION_NOT_FOUND,
  INVALID_TRANSACTION_TYPE,
  NO_UPDATE,
} = require("../constants/messages");
const makeId = require("../utils/random_string");

const router = express.Router();

// Add Transaction
router.post("/", authenticateToken, async (req, res) => {
  const { name, type, category, amount, date } = req.body;
  const cred = decoded_access(req.headers["authorization"]);
  if (!name || !type || !category || !amount || !date) {
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
        error: USER_NOT_FOUND,
      });
      return;
    }
    if (type === "income") {
      user.u_balance += parseFloat(amount);
    } else if (type === "expense") {
      user.u_balance -= parseFloat(amount);
    } else {
      throw Error(INVALID_TRANSACTION_TYPE);
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
        t_date: date,
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
        error: USER_NOT_FOUND,
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

// edit transaction
router.put("/", authenticateToken, async (req, res) => {
  const { name, type, category, amount, date } = req.body;
  const { q } = req.query;
  const cred = decoded_access(req.headers["authorization"]);
  if (!name || !type || !category || !amount || !date) {
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
        error: USER_NOT_FOUND,
      });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        t_uid: q,
        t_is_deleted: false,
      },
    });

    if (!transaction) {
      res.status(404).send({
        success: false,
        error: TRANSACTION_NOT_FOUND,
      });
      return;
    }

    if (type === "income") {
      user.u_balance += parseFloat(amount);
    } else if (type === "expense") {
      user.u_balance -= parseFloat(amount);
    } else {
      throw Error(INVALID_TRANSACTION_TYPE);
    }

    if (
      transaction.t_name === name &&
      transaction.t_type === type &&
      transaction.t_category === category &&
      transaction.t_amount === parseFloat(amount) &&
      transaction.t_date === date
    ) {
      return res.status(200).send({
        success: true,
        message: NO_UPDATE,
      });
    }

    await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_balance: user.u_balance,
      },
    });

    const result = await prisma.transaction.update({
      where: {
        t_uid: q,
      },
      data: {
        t_name: name,
        t_type: type,
        t_category: category,
        t_amount: parseFloat(amount),
        t_date: date,
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

// delete transaction
router.delete("/", authenticateToken, async (req, res) => {
  const cred = decoded_access(req.headers["authorization"]);
  const { q } = req.query;
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
        error: USER_NOT_FOUND,
      });
      return;
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        t_uid: q,
        t_is_deleted: false,
      },
    });

    if (!transaction) {
      res.status(404).send({
        success: false,
        error: TRANSACTION_NOT_FOUND,
      });
      return;
    }

    if (transaction.t_type === "income") {
      user.u_balance -= parseFloat(transaction.t_amount);
    } else if (transaction.t_type === "expense") {
      user.u_balance += parseFloat(transaction.t_amount);
    } else {
      throw Error(INVALID_TRANSACTION_TYPE);
    }

    await prisma.user.update({
      where: {
        u_uid: cred.uid,
      },
      data: {
        u_balance: user.u_balance,
      },
    });

    const result = await prisma.transaction.update({
      where: {
        t_uid: q,
      },
      data: {
        t_is_deleted: true,
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

module.exports = router;
