const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure:
    String(process.env.EMAIL_SECURE).toLowerCase() ===
    "true",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"BAG HEE BAG" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject: "Welcome to BAG HEE BAG 👜",

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </head>

          <body style="
            margin:0;
            padding:0;
            background:#f4f1eb;
            font-family:Arial,Helvetica,sans-serif;
          ">

            <div style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            ">

              <div style="
                background:#090909;
                padding:32px 25px;
                text-align:center;
              ">
                <h1 style="
                  margin:0;
                  color:#d4af69;
                  font-size:30px;
                  letter-spacing:3px;
                ">
                  BAG HEE BAG
                </h1>

                <p style="
                  margin:10px 0 0;
                  color:#bdbdbd;
                  font-size:13px;
                  letter-spacing:1px;
                ">
                  STYLE • ELEGANCE • EVERYDAY
                </p>
              </div>

              <div style="padding:35px 30px;">

                <h2 style="
                  margin-top:0;
                  color:#222222;
                  font-size:24px;
                ">
                  Welcome, ${user.name}!
                </h2>

                <p style="
                  color:#555555;
                  font-size:15px;
                  line-height:1.8;
                ">
                  We're delighted to welcome you to
                  <strong>BAG HEE BAG</strong>.
                  Your account has been created successfully.
                </p>

                <p style="
                  color:#555555;
                  font-size:15px;
                  line-height:1.8;
                ">
                  Discover our collection of elegant handbags,
                  ladies' bags, travel bags, school & college bags,
                  and special occasion styles.
                </p>

                <div style="
                  margin:30px 0;
                  padding:20px;
                  background:#faf8f3;
                  border-left:4px solid #d4af69;
                  border-radius:8px;
                ">
                  <p style="
                    margin:0;
                    color:#333333;
                    font-size:14px;
                    line-height:1.7;
                  ">
                    Your BAG HEE BAG journey starts here.
                    We hope you find something you truly love.
                  </p>
                </div>

                <p style="
                  color:#555555;
                  font-size:15px;
                  line-height:1.8;
                ">
                  Thank you for choosing BAG HEE BAG.
                </p>

                <p style="
                  margin-top:30px;
                  color:#222222;
                  font-size:15px;
                  line-height:1.6;
                ">
                  Warm regards,<br />
                  <strong>Team BAG HEE BAG</strong>
                </p>

              </div>

              <div style="
                background:#090909;
                padding:20px;
                text-align:center;
              ">
                <p style="
                  margin:0;
                  color:#888888;
                  font-size:12px;
                ">
                  © ${new Date().getFullYear()}
                  BAG HEE BAG. All rights reserved.
                </p>
              </div>

            </div>

          </body>
        </html>
      `,
    });

    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error(
      `Welcome email failed for ${user.email}:`,
      error.message
    );
  }
};

const sendOrderConfirmationEmail = async (
  user,
  order
) => {
  try {
    const orderNumber =
      order.orderNumber ||
      order._id?.toString() ||
      "N/A";

    const totalAmount = Number(
      order.totalAmount || order.total || 0
    ).toFixed(2);

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"BAG HEE BAG" <${process.env.EMAIL_USER}>`,

      to: user.email,

      subject: `Order Confirmed — BAG HEE BAG #${orderNumber}`,

      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </head>

          <body style="
            margin:0;
            padding:0;
            background:#f4f1eb;
            font-family:Arial,Helvetica,sans-serif;
          ">

            <div style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:0 10px 30px rgba(0,0,0,0.08);
            ">

              <div style="
                background:#090909;
                padding:32px 25px;
                text-align:center;
              ">
                <h1 style="
                  margin:0;
                  color:#d4af69;
                  font-size:30px;
                  letter-spacing:3px;
                ">
                  BAG HEE BAG
                </h1>

                <p style="
                  margin:10px 0 0;
                  color:#bdbdbd;
                  font-size:13px;
                  letter-spacing:1px;
                ">
                  ORDER CONFIRMATION
                </p>
              </div>

              <div style="padding:35px 30px;">

                <h2 style="
                  margin-top:0;
                  color:#222222;
                  font-size:24px;
                ">
                  Thank you, ${user.name || "Customer"}!
                </h2>

                <p style="
                  color:#555555;
                  font-size:15px;
                  line-height:1.8;
                ">
                  Your order has been successfully placed with
                  <strong>BAG HEE BAG</strong>.
                </p>

                <div style="
                  margin:25px 0;
                  padding:20px;
                  background:#faf8f3;
                  border-left:4px solid #d4af69;
                  border-radius:8px;
                ">

                  <p style="
                    margin:0 0 10px;
                    color:#333333;
                    font-size:14px;
                  ">
                    <strong>Order Number:</strong>
                    ${orderNumber}
                  </p>

                  <p style="
                    margin:0;
                    color:#333333;
                    font-size:14px;
                  ">
                    <strong>Order Total:</strong>
                    ₹${totalAmount}
                  </p>

                </div>

                <p style="
                  color:#555555;
                  font-size:15px;
                  line-height:1.8;
                ">
                  We'll keep you updated about your order status,
                  shipping and delivery.
                </p>

                <p style="
                  margin-top:30px;
                  color:#222222;
                  font-size:15px;
                  line-height:1.6;
                ">
                  Warm regards,<br />
                  <strong>Team BAG HEE BAG</strong>
                </p>

              </div>

              <div style="
                background:#090909;
                padding:20px;
                text-align:center;
              ">
                <p style="
                  margin:0;
                  color:#888888;
                  font-size:12px;
                ">
                  © ${new Date().getFullYear()}
                  BAG HEE BAG. All rights reserved.
                </p>
              </div>

            </div>

          </body>
        </html>
      `,
    });

    console.log(
      `Order confirmation email sent to ${user.email}`
    );
  } catch (error) {
    console.error(
      `Order confirmation email failed for ${user.email}:`,
      error.message
    );
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
};