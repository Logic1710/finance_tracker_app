const createError = require("http-errors");
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./utils/oAuth");

// import all routes
const userRouter = require("./route/user");
const transactionRouter = require("./route/transaction");

const cors = require("cors");

const app = express();

app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("Server is running on port " + port));

//log
app.use((req, res, next) => {
  const start = Date.now();
  let responseBody = "";

  // Create a custom writable stream to capture the response body
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    responseBody += chunk.toString(); // Capture the chunk
    originalWrite.apply(res, [chunk, ...args]); // Call the original `res.write`
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      responseBody += chunk.toString(); // Capture the final chunk
    }
    originalEnd.apply(res, [chunk, ...args]); // Call the original `res.end`
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.url}` +
        "\n" +
        `Body: ${JSON.stringify(req.body)}` +
        "\n" +
        `Status: ${res.statusCode} ${res.statusMessage}\`` +
        "\n" +
        `Response Time: ${duration}ms` +
        "\n" +
        `Client IP: ${req.ip}`,
      "\n" + `Response Body: ${responseBody}`,
    );
  });
  next();
});

//session
app.use(
  session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(
  cors({
    origin: "*", // change this to the domain you will make the request from
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/user", userRouter);
app.use("/transaction", transactionRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
