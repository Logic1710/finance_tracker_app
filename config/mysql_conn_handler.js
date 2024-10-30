const conn = require("./mysql");

const handleConnection = () => {
    conn.connect(function (err) {
        if (err) {
            if (err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE") {
                return;
            }
            console.error(err);
            process.exit();
        }
    });

    conn.on("error", function (err) {
        console.log("db error", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
            // Connection to the MySQL server is usually
            handleConnection(); // lost due to either server restart, or a
        } else {
            // connection idle timeout (the wait_timeout
            console.error(err);
            handleConnection(); // server variable configures this)
        }
    });
};
handleConnection();

module.exports = conn;
