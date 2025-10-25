import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Represents the result of sending a reset password email.
 */
export interface SendResetEmailResult {
  success: boolean;
  error?: string;
}

/**
 * Asynchronously sends a password reset link to the given email.
 * @param email The email address to send the reset link to.
 * @param link The password reset link.
 * @returns A promise that resolves to a SendResetEmailResult.
 */
export async function sendResetPasswordEmail(
  email: string,
  link: string
): Promise<SendResetEmailResult> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 587),
      secure: false, // true for port 465, false for others
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${link}">${link}</a>
        <p>If you didn’t request this, you can ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    console.log('Reset email sent:', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending reset email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}


export const sendSellerApplicationEmail = async (
  email: string, 
  firstName: string
): Promise<void> => {
  const subject = "Application Received - We'll Review Your Profile";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Thank you for your application, ${firstName}!</h2>
      <p>We've received your seller application and our team will review it within 2-3 business days.</p>
      <p>You'll receive another email once we've completed our review with the next steps.</p>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Platform Team</p>
    </div>
  `;
  
  // Use your existing email service implementation
  // await sendEmail(email, subject, html);
};

export const sendSellerStatusUpdateEmail = async (
  email: string, 
  firstName: string, 
  status: string, 
  reviewNotes?: string
): Promise<void> => {
  const subject = `Application Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  
  let message = '';
  let color = '#4F46E5';
  
  switch (status) {
    case 'approved':
      message = "Congratulations! Your seller application has been approved. You can now start creating and selling projects.";
      color = '#10B981';
      break;
    case 'rejected':
      message = "Unfortunately, your seller application was not approved at this time.";
      color = '#EF4444';
      break;
    case 'suspended':
      message = "Your seller account has been suspended. Please contact support for more information.";
      color = '#F59E0B';
      break;
    default:
      message = "Your application status has been updated.";
  }
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${color};">Hello ${firstName},</h2>
      <p>${message}</p>
      ${reviewNotes ? `<p><strong>Review Notes:</strong> ${reviewNotes}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
      <p>Best regards,<br>The Platform Team</p>
    </div>
  `;
  
  // Use your existing email service implementation
  // await sendEmail(email, subject, html);
};