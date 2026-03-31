require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"NexCart" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("Successfully sent email to ", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name, verifyLink) {
  const upperName = name?.toUpperCase() || "USER";

  const subject = "Welcome to NexCart – Let’s Start Shopping! 🚀";

  const text = `
🎉 Welcome to NexCart

Hello ${upperName} 👋

Your account has been successfully created!

Start exploring amazing products, deals, and offers today.

👉 Visit: https://nexcart.com

Happy Shopping 🛍️
NexCart Team
`;

  const html = `
<div style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
  
  <table align="center" width="100%" style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg,#ff7a18,#ff3d00);padding:30px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:26px;">🛒 NexCart</h1>
        <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Welcome to NexCart</p>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding:30px;">
        
        <h2 style="color:#333;margin-top:0;">Hello ${upperName} 👋</h2>

        <p style="color:#555;font-size:15px;line-height:1.6;">
          🎉 Your account has been successfully created!  
          You're just one step away from starting your shopping journey.
        </p>

        <!-- 🔐 Verification Box -->
        <div style="background:#fff3f0;border-left:4px solid #ff3d00;padding:15px;margin:20px 0;border-radius:6px;">
          <p style="margin:0;font-size:14px;color:#333;">
            🔐 Please verify your email to activate your account.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin:30px 0;">
          <a href="${verifyLink}" 
             style="display:inline-block;padding:14px 30px;background:linear-gradient(135deg,#ff7a18,#ff3d00);color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:bold;">
            ✅ Verify My Account
          </a>
        </div>

        <!-- Features -->
        <div style="margin:20px 0;">
          <p style="margin:10px 0;font-size:14px;">🛍️ Browse thousands of products</p>
          <p style="margin:10px 0;font-size:14px;">⚡ Fast & secure checkout</p>
          <p style="margin:10px 0;font-size:14px;">🎁 Exclusive deals & offers</p>
        </div>

        <p style="color:#777;font-size:13px;text-align:center;">
          ⏳ This verification link will expire soon
        </p>

        <p style="margin-top:20px;color:#333;font-weight:bold;">
          — Team NexCart 🛍️
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f9fafb;padding:20px;text-align:center;font-size:12px;color:#888;">
        
        📩 Support: support@nexcart.com<br/><br/>
        
        🔒 If you didn’t create this account, please ignore this email.<br/><br/>
        
        © 2026 NexCart — All Rights Reserved.
      
      </td>
    </tr>

  </table>

</div>
`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetOTPEmail(userEmail, name, otp) {
  const upperName = name?.toUpperCase() || "USER";

  const subject = "🔐 Your OTP for Password Reset";

  const html = `
  <div style="font-family: Arial, sans-serif; background-color:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:#111827; color:white; padding:20px; text-align:center;">
        <h2>Password Reset OTP</h2>
      </div>

      <!-- Body -->
      <div style="padding:30px; color:#333; text-align:center;">
        <h3>Hello ${upperName},</h3>
        <p>Use the OTP below to reset your password:</p>

        <!-- OTP Box -->
        <div style="font-size:30px; font-weight:bold; letter-spacing:8px; margin:20px 0; color:#111827;">
          ${otp}
        </div>

        <p>This OTP is valid for <b>10 minutes</b>.</p>

        <p style="color:red;"><b>Do NOT share this OTP with anyone.</b></p>

        <p>If you didn’t request this, you can safely ignore this email.</p>

        <p>Stay secure,<br/>Your Team 🚀</p>
      </div>

      <!-- Footer -->
      <div style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;">
        © 2026 Your Company. All rights reserved.
      </div>

    </div>
  </div>
  `;

  const text = `
Hello ${upperName},

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.
Do not share it with anyone.

If you didn’t request this, ignore this email.

Thanks,
Your Team
`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendOTPVerifiedEmail(userEmail, name, otp) {
  const upperName = name?.toUpperCase() || "USER";

  const subject = "✅ OTP Verified Successfully";

  const text = `
    Hello ${upperName},
    
    Your OTP for verification is: ${otp}
    
    This OTP is valid for 10 minutes.
    
    ⚠️ Do not share this OTP with anyone.
    
    If you did not request this, please ignore this email.
    
    Thanks,
    Team NexCart
    `;

  const html = `
  <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px;">
      
      <div style="background:#22c55e; color:#fff; padding:20px; text-align:center;">
        <h2>OTP Verified</h2>
      </div>

      <div style="padding:30px;">
        <h3>Hello ${upperName},</h3>
        <p>Your OTP has been successfully verified.</p>
        <p>You can now reset your password safely.</p>
      </div>

      <div style="background:#f1f1f1; padding:15px; text-align:center;">
        © 2026 NexCart
      </div>
    </div>
  </div>
  `;
  await sendEmail(userEmail, subject, text, html);
}

async function sendPasswordResetSuccessEmail(userEmail, name) {
  const upperName = name?.toUpperCase() || "USER";

  const subject = "🔐 Password Reset Successful";

  const text = `
Hello ${upperName},

Your password has been successfully reset.

If you made this change, you can safely ignore this email.

⚠️ If you did NOT reset your password, please contact support immediately.

Stay secure,
Team NexCart
`;

  const html = `
  <div style="font-family: Arial; background:#f4f6f8; padding:20px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:10px;">
      
      <div style="background:#4f46e5; color:#ffffff; padding:20px; text-align:center;">
        <h2>Password Updated</h2>
      </div>

      <div style="padding:30px; color:#333;">
        <h3>Hello ${upperName},</h3>
        <p>Your password has been successfully changed.</p>

        <p>If you did not perform this action, please contact support immediately.</p>

        <p style="margin-top:20px;">
          Stay secure,<br/>
          <b>Team NexCart 🚀</b>
        </p>
      </div>

      <div style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px;">
        © 2026 NexCart. All rights reserved.
      </div>

    </div>
  </div>
  `;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendEmail,
  sendPasswordResetOTPEmail,
  sendOTPVerifiedEmail,
  sendPasswordResetSuccessEmail,
};
