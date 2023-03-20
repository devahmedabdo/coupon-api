const express = require("express");
const router = express.Router();
const Coupon = require("../models/coupon");
const auth = require("../middelware/auth");

router.post("/coupon", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    const couponsDescription = [];
    coupons.forEach((e) => {
      couponsDescription.push(e.description);
    });
    const dublicatedCoupon = [];
    let newCoupons = req.body.coupons.split("\n");
    let finalCoupons = [];
    newCoupons.forEach((e) => {
      if (couponsDescription.includes(e.replace(/\s+/g, ""))) {
        return dublicatedCoupon.push(e);
      }
      finalCoupons.push(e);
    });
    finalCoupons.forEach(async (e) => {
      let body = { description: e };
      if (e == "") {
        return;
      }
      const coupon = await new Coupon(body);
      await coupon.save();
    });
    res.status(200).send({ dublicatedCoupon });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.get("/coupons", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    res.status(200).send({ coupons });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
//used
router.get("/usedcoupons", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({ used: true });
    res.status(200).send({ coupons });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.get("/unusedcoupons", auth, async (req, res) => {
  try {
    const coupons = await Coupon.find({ used: false });
    res.status(200).send({ coupons });
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// by name
router.get("/coupon", auth, async (req, res) => {
  try {
    const coupon = await Coupon.find({ description: req.body.description });
    if (!coupon) {
      res.status(404).send("coupon not found");
    }
    res.status(200).send(coupons);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.delete("/coupon/:id", auth, async (req, res) => {
  const coupon = await Coupon.findOneAndDelete({ _id: req.params.id });
  if (!coupon) {
    return res.status(404).send("No coupon found to delete");
  }
  res.status(200).send(coupon);
});
router.delete("/usedcoupon", auth, async (req, res) => {
  const coupons = await Coupon.deleteMany({ used: true });
  if (!coupons) {
    return res.status(404).send("No coupon found to delete");
  }
  res.status(200).send(coupons);
});
router.delete("/deleteallcoupons", auth, async (req, res) => {
  const coupons = await Coupon.deleteMany({});
  if (!coupons) {
    return res.status(404).send("No coupon found to delete");
  }
  res.status(200).send(coupons);
});
module.exports = router;
