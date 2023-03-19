const mongoose = require("mongoose");
const couponSchema = mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   // required: true,
    //   ref: "User",
    // },
  },
  { timestamps: true }
);

couponSchema.methods.toJSON = function () {
  const news = this;
  const newsObject = news.toObject();
  // delete newsObject.puplisher;
  return newsObject;
};
couponSchema.virtual("user", {
  ref: "User",
  localField: "_id",
  foreignField: "coupon",
});
const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
