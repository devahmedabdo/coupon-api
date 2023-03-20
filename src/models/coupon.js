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
  },
  { timestamps: true }
);

couponSchema.methods.toJSON = function () {
  const news = this;
  const newsObject = news.toObject();
  return newsObject;
};
couponSchema.virtual("user", {
  ref: "User",
  localField: "_id",
  foreignField: "coupon",
});
const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
