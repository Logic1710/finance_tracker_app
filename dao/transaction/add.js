const Transaction = require("../../model/transacation");

const conn = require("../../config/mysql_conn_handler");
const { WRONG_OBJECT } = require("../../constants/error_messages");

module.exports.addTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    if ((!transaction) instanceof Transaction) {
      reject(WRONG_OBJECT);
    }

    const query =
      "INSERT INTO `transaction`(`t_uid`, `t_u_uid`, `t_name`, `t_type`, `t_category`, `t_amount`, `t_is_deleted`) VALUES (?,?,?,?,?,?,?)";
    conn.query(
      query,
      [
        transaction.uid,
        transaction.u_uid,
        transaction.name,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.is_deleted,
      ],
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          transaction.id = res.insertId;
          delete transaction.id;
          resolve(transaction);
        }
      },
    );
  });
};
