import nodemailer from "nodemailer";
import Settings from "@/models/Settings";
import { decryptPassword } from "@/lib/encryption";

/**
 * Get email configuration with fallback to environment variables
 * (exact ref repo pattern from config/sendmail.js)
 */
async function getEmailConfig() {
  try {
    const dbConfig = await Settings.findOne();

    if (
      dbConfig?.smtp?.host &&
      dbConfig?.smtp?.user &&
      dbConfig?.smtp?.password
    ) {
      // Decrypt password from DB (exact ref repo pattern)
      const decryptedPassword = decryptPassword(dbConfig.smtp.password);

      return {
        host: dbConfig.smtp.host,
        port: parseInt(String(dbConfig.smtp.port)) || 587,
        auth: {
          user: dbConfig.smtp.user,
          pass: decryptedPassword,
        },
        from: dbConfig.contactEmail || dbConfig.smtp.user,
        secure: parseInt(String(dbConfig.smtp.port)) === 465,
        tls: {
          rejectUnauthorized: false,
        },
      };
    } else {
      // Fallback to environment variables (exact ref repo pattern)
      return {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        from: process.env.SMTP_USER,
        secure: Number(process.env.SMTP_PORT) === 465,
        tls: {
          rejectUnauthorized: false,
        },
      };
    }
  } catch (error) {
    console.error("❌ Error getting email configuration:", error);
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      from: process.env.SMTP_USER,
      secure: Number(process.env.SMTP_PORT) === 465,
      tls: {
        rejectUnauthorized: false,
      },
    };
  }
}

/**
 * Send order confirmation email with invoice attachment
 */
export const sendOrderConfirmationEmail = async (
  order: any,
  invoicePDFBuffer: Buffer | Uint8Array,
) => {
  try {
    // Get email configuration (exact ref repo pattern)
    const emailConfig = await getEmailConfig();

    if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn(
        "SMTP configuration missing (checked DB and ENV). Skipping email.",
      );
      return { success: false, message: "SMTP config missing" };
    }

    const transporter = nodemailer.createTransport(emailConfig as any);

    // Get company settings
    const settings = await Settings.findOne();
    const companyName = settings?.shopName || "Sai Nandhini Tasty World";
    const companyEmail = settings?.contactEmail || emailConfig.auth.user;

    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #800000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${order.shippingAddress?.fullName || "Customer"},</p>
            <p>Thank you for your order! We are pleased to confirm that we have received your payment for order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong>.</p>
            <p>Your order is now being processed. You can find your invoice attached to this email.</p>
            
            <h3>Order Summary</h3>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice.toFixed(2)}</p>
            
            <p>We will notify you once your order is shipped.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email with invoice attachment
    const mailOptions = {
      from: `"${companyName}" <${companyEmail}>`,
      to: order.shippingAddress?.email,
      subject: `Order Confirmation – #${order._id.toString().slice(-6).toUpperCase()}`,
      html: emailHTML,
      attachments: [
        {
          filename: `Invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`,
          content: Buffer.from(invoicePDFBuffer),
          contentType: "application/pdf",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Order confirmation email sent to ${order.shippingAddress?.email}:`,
      info.messageId,
    );

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    // Do not throw, return failure status so payment flow isn't interrupted
    return { success: false, error: error };
  }
};
