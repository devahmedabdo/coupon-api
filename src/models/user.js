const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      // required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      // unique: true,
      validate(value) {
        if (!validator.isMobilePhone(value, ["ar-SA"])) {
          console.log(value);
          throw new Error("Please Enter SA phone number");
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Please Enter Valid Email");
        }
      },
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
      ref: "Coupon",
    },
    tokens: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcryptjs.hash(user.password, 8);
  }
});
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("please check your emailw or password");
  }
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new Error("please check your email or password");
  }
  return user;
};
userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat(token);
  await user.save();
  return token;
};
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
