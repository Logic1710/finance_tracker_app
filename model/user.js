class User {
    constructor(
        id,
        uid,
        fullname,
        username,
        email,
        balance,
        salt,
        password,
        created,
        last_modified,
        is_deleted,
    ) {
        this.id = id;
        this.uid = uid;
        this.fullname = fullname;
        this.username = username;
        this.email = email;
        this.balance = balance;
        this.salt = salt;
        this.password = password;
        this.created = created;
        this.last_modified = last_modified;
        this.is_deleted = is_deleted;
    }
}

module.exports = User;
