class Transaction {
  constructor(
    id,
    uid,
    u_uid,
    name,
    type,
    category,
    amount,
    created_at,
    updated_at,
    is_deleted,
  ) {
    this.id = id;
    this.uid = uid;
    this.u_uid = u_uid;
    this.name = name;
    this.type = type;
    this.category = category;
    this.amount = amount;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.is_deleted = is_deleted;
  }
}

module.exports = Transaction;
