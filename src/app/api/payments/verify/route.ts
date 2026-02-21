import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import Settings from "@/models/Settings";
import { decryptPassword } from "@/lib/encryption";
import { generateInvoiceHTML } from "@/lib/invoice-generator";
import { generatePDFFromHTML } from "@/lib/pdf-generator";
import { sendOrderConfirmationEmail } from "@/lib/email-service";

// Helper: get decrypted payment config from DB (exact ref repo pattern)
async function getDecryptedPaymentConfig() {
  const config = await Settings.findOne();
  if (!config?.payment?.razorpayKeyId) return null;

  return {
    keyId: config.payment.razorpayKeyId,
    keySecret: config.payment.razorpayKeySecret
      ? decryptPassword(config.payment.razorpayKeySecret)
      : null,
  };
}

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 },
      );
    }

    await connectDB();

    // Get decrypted config (exact ref repo pattern)
    const paymentConfig = await getDecryptedPaymentConfig();
    const key_secret =
      paymentConfig?.keySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      console.error("RAZORPAY_KEY_SECRET is missing");
      return NextResponse.json(
        { error: "Payment config missing" },
        { status: 500 },
      );
    }

    const generated_signature = crypto
      .createHmac("sha256", key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          isPaid: true,
          paidAt: Date.now(),
          paymentResult: {
            id: razorpay_payment_id,
            status: "completed",
            email_address: "",
          },
        },
        { new: true },
      ).populate("user");

      if (!updatedOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Trigger Email with Invoice (Async - don't block response)
      (async () => {
        try {
          console.log("Generating invoice for order:", updatedOrder._id);
          const invoiceHTML = await generateInvoiceHTML(updatedOrder);
          const pdfBuffer = await generatePDFFromHTML(invoiceHTML);
          await sendOrderConfirmationEmail(updatedOrder, pdfBuffer);
        } catch (emailError) {
          console.error("Failed to send invoice email:", emailError);
        }
      })();

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        orderId: updatedOrder._id,
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
