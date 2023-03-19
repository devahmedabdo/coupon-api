const express = require("express");
const router = express.Router();
const User = require("../models/user");
const auth = require("../middelware/auth");
const Coupon = require("../models/coupon");
const nodemailer = require("nodemailer");
const exceljs = require("exceljs");
function sendEmail(email, coupon) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_SECRET_EMAIL,
        pass: process.env.MY_SECRET_EMAILPASSWORD,
      },
    });
    const mailOption = {
      from: process.env.MY_SECRET_EMAIL,
      to: email,
      subject: "copoun",
      // text: coupon,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet">
      </head>
      <style>
        :root {
          --main: #cf046e;
          --lmain: #de5a9e;
        }

        body {
          text-align: center;
          font-family: "Noto Kufi Arabic", sans-serif;
          border-top: 100px solid var(--lmain);
          background-color: #ebebeb;
        }

        .container {
          padding: 50px 20px;
          max-width: 1200px;
          width: 90%;
          margin: auto;
          margin-top: -50px;
          border-radius: 10px;
          background-color: #ffffff;
        }

        .main {
          color: var(--main);
        }

        .lmain {
          color: var(--lmain);
        }

        .text-right {
          text-align: right;
        }

        .coupon {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100px;
          width: 200px;
          margin: auto;
          background: var(--main);
          color: white;
          border-radius: 10px;
          font-size: 30px;
          font-weight: 900;
        }
      </style>

      <body dir="rtl">
        <div class="container">
          <h1 class="lmain">هلا وسهلا , أسفرت <span class="main">و أنورت</span> ! </h1>
          <p>
            سعيدين مره لإنضمامك معنا ببرنامج التسويق بالعمولة و واثقين اننا بنوصل لنتايج رهيبه معك ! 😎

          </p>
          <h2>قبل نبدأ حابين نخبرك بمزايا الكود وكيف تسوق له والعمولة المتوقعه منه :
          </h2>

          <div class="text-right">
            <h3>
              -الكود بيخصم 10% على جميع الطلبات .

            </h3>
            <h3>
              -عمولتك هي 10 ريال بكل مره يطلب العميل بكودك من مطعم جديد ! .

            </h3>
            <h3>
              -العموله بيتم تحويلها لك نهاية كل شهر على محفظتك في urpay .

            </h3>
            <h3>
              -بيتم إرسال تقرير بالمبيعات بشكل اسبوعي كرساله SMS على رقم جوالك.

            </h3>
            <h3>
              -في حال تم التسويق للكود في حسابات كاري الرسميه , أو انشاء حسابات وهمية تتقمص كيان تطبيق كاري سيتم إيقاف تفعيل
              الكود مباشرة.

            </h3>
          </div>
          <span>وبس والله .. بهذي السهولة تخيّل ! </span>

          <p>تفضل هذا الكود (${coupon}) و مرفق لك في الإيميل تصميم تقدر تستخدمة للأعلان عن الكود</p>
          <div class="coupon">
          ${coupon}
          </div>
        </div>
      </body>
      </html>`,
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
        return reject({ messege: "an error has occured" });
      }
      return resolve({ messege: "message sent succesfully" });
    });
  });
}
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    const usersWithCoupon = [];
    for (let i = 0; i < users.length; i++) {
      await users[i].populate("coupon");
      usersWithCoupon.push(users[i]);
    }
    res.send({ users: usersWithCoupon });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.get("/searchuser", auth, async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    await user.populate("coupon");
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/signup", async (req, res) => {
  try {
    req.body.phone = "+966" + req.body.phone;
    const user = await new User(req.body);
    const coupon = await Coupon.findOne({ used: false });
    if (!coupon) {
      return res.status(400).send({ coupon: "No coupon are availble" });
    }
    const token = await user.generateToken();
    coupon.used = true;
    coupon.save();
    user.coupon = coupon._id;
    // if (!user.isAdmin) {
    //   // coupon.owner = user._id;
    // }
    await user.populate("coupon");
    await user.save();
    sendEmail(user.email, coupon.description)
      .then((res) => {
        // res.send(res);
        console.log(res);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/addAdmin", auth, async (req, res) => {
  try {
    // const coupon = await Coupon.findOne({ used: false });
    const user = await new User(req.body);
    // if (!coupon ) {
    //   return res.status(400).send({ coupon: "No coupon are availble" });
    // }
    const token = await user.generateToken();
    // if (!user.isAdmin) {
    //   // coupon.owner = user._id;
    //   coupon.used = true;
    //   coupon.save();
    //   user.coupon = coupon._id;
    // }
    // await user.populate("coupon");
    await user.save();
    // sendEmail(user.email, coupon.description)
    //   .then((res) => {
    //     // res.send(res);
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     res.status(500).send(err);
    //   });
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
// router.post("/email", async (req, res) => {
//   try {
//     sendEmail(req.body.email, "coptest")
//       .then((res) => {
//         res.send(res);
//       })
//       .catch((err) => {
//         res.send(err);
//       });
//     // req.writer.avatar = req.file.buffer;
//     // await req.writer.save();
//     // res.send();
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// router.post("/writerImg", auth, uploads.single("avatar"), async (req, res) => {
//   console.log(req.file);
//   try {
//     req.writer.avatar = req.file.buffer;
//     await req.writer.save();
//     res.send();
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();

    res.send({ user, token });
  } catch (e) {
    res.status(401).send(e.message);
  }
});
router.patch("/user", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((e) => {
      req.user[e] = req.body[e];
    });
    await req.user.save();

    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// router.get("/writer", auth, async (req, res) => {
//   try {
//     await req.writer.populate("news");
//     res.status(200).send({ profile: req.writer, news: req.writer.news });
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// router.post("/email", async (req, res) => {
//   try {
//     const email = await User.findOne({ email: req.body.email });
//     // console.log(req.body);
//     if (!email) return res.status(200).send(false);
//     res.status(200).send(true);
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
// router.delete("/writer", auth, async (req, res) => {
//   try {
//     await req.writer.remove();
//   } catch (e) {
//     res.status(400).send(e.message);
//   }
// });
router.delete("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((ele) => {
      return ele != req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send(e);
  }
});
router.delete("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Signed out from all devices");
  } catch (e) {
    res.status(500).send(e);
  }
});
router.get("/exportdata", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false });
    const usersWithCoupon = [];
    for (let i = 0; i < users.length; i++) {
      await users[i].populate("coupon");
      usersWithCoupon.push(users[i]);
    }
    let userData = new exceljs.Workbook();
    const sheet = userData.addWorksheet("users");
    sheet.columns = [
      {
        header: "الإسم",
        key: "name",
      },
      {
        header: "رقم الجوال",
        key: "phone",
      },
      {
        header: "البريد الاكترونى",
        key: "email",
      },
      {
        header: "الكوبون",
        key: "coupon",
      },
      {
        header: "تاريخ الانضمام",
        key: "date",
      },
    ];
    await usersWithCoupon.map((value, index) => {
      sheet.addRow({
        name: value.firstName + " " + lastName,
        email: value.email,
        phone: value.phone,
        coupon: value.coupon.description,
        date: value.createdAt,
      });
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("content-Disposition", "attachment;filename=" + "users.xlsx");
    userData.xlsx.write(res);
    res.send(userData);
  } catch (e) {
    res.status(400).send(e);
  }
});
module.exports = router;
