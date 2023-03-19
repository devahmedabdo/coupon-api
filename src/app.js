const express = require("express");
const userRouter = require("./routers/user");
const couponRouter = require("./routers/coupon");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const cors = require("cors");
// connect database
require("./db/mongoose");
// to use my route in front
app.use(cors());
// parse automatic
app.use(express.json());
//
app.use(userRouter);
app.use(couponRouter);

app.listen(port, () => {
  console.log("Server is running " + port);
});
