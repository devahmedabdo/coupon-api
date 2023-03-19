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
// router.post("/coupon", auth, async (req, res) => {
//   try {
//     const coupon = await new Coupon(req.body);
//     await coupon.save();
//     res.status(200).send(coupon);
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
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
// router.post("/add", auth, uploads.single("image"), async (req, res) => {
//   try {
//     const news = await new News(req.body);
//     news.publisher = req.writer._id;

//     await news.save();
//     res.status(200).send(news);
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// router.patch(
//   "/replies/:id",
//   auth,
//   uploads.single("image"),
//   async (req, res) => {
//     try {
//       const mainNews = await News.find({});
//       // publisher: req.writer._id,

//       if (!mainNews) {
//         return res.status(200).send("no main news");
//       }
//       const branchNews = await new News(req.body);
//       // branchNews.publisher = req.writer._id;
//       // news.image = req.file.buffer;
//       // mainNews.replies.push(branchNews);
//       console.log(mainNews);
//       // await mainNews.save();
//       res.status(200).send(mainNews);
//     } catch (e) {
//       res.status(400).send(e.message);
//     }
//   }
// );

// router.get("/news/:id", auth, async (req, res) => {
//   try {
//     const news = await News.findOne({
//       _id: req.params.id,
//       publisher: req.writer._id,
//     });
//     if (!news) {
//       return res.status(404).send("No News found to for this id");
//     }
//     await news.populate("publisher");
//     res.status(200).send({ news, publisher: news.publisher.name });
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// router.get("/news", auth, async (req, res) => {
//   try {
//     const news = await News.find({ publisher: req.writer._id });
//     if (!news) {
//       return res.status(404).send("No News found for you");
//     }
//     res.status(200).send({ news, publisher: req.writer.name });
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// // router.patch("/news/:id", auth, uploads.single("image"), async (req, res) => {
// //   try {
// //     const news = await News.findOne({
// //       _id: req.params.id,
// //       publisher: req.writer._id,
// //     });
// //     if (!news) {
// //       return res.status(404).send("No News found to edit");
// //     }
// //     const updates = Object.keys(req.body);
// //     updates.forEach((e) => {
// //       news[e] = req.body[e];
// //     });
// //     if (req.file) {
// //       news.image = req.file.buffer;
// //     }
// //     await news.save();
// //     res.status(200).send(news);
// //   } catch (e) {
// //     res.status(400).send(e.message);
// //   }
// // });

// router.get("/timeline", async (req, res) => {
//   try {
//     let timeline = await News.find({});
//     let arr = [];
//     for (let i = 0; i < timeline.length; i++) {
//       await timeline[i].populate("publisher");
//       arr.push(timeline[i]);
//     }

//     res.status(200).send(arr);
//   } catch (e) {
//     res.status(401).send("401" + e);
//   }
// });
// router.get("/t", auth, (req, res) => {
//   try {
//     res.status(200).send("hellow");
//   } catch (e) {
//     res.status(401).send("401" + e);
//   }
// });
module.exports = router;
