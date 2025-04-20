import nodemailer from 'nodemailer';

// Email configuration from environment variables
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'riyadkhanxp2@gmail.com',
    pass: process.env.EMAIL_PASS || 'ngan rxzh oodx hbdx',
  },
};

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};

interface SendEmailProps {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email with the configured transporter
 */
export const sendEmail = async ({ to, subject, text, html }: SendEmailProps) => {
  const transporter = createTransporter();
  
  // Verify SMTP connection configuration
  try {
    await transporter.verify();
  } catch (error) {
    console.error('SMTP connection error:', error);
    throw new Error('Failed to connect to email server');
  }
  
  const message = {
    from: emailConfig.auth.user,
    to,
    subject,
    text,
    html,
  };
  
  try {
    const info = await transporter.sendMail(message);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  return sendEmail({
    to: email,
    subject: 'Password Reset Request',
    text: `You are receiving this email because you (or someone else) has requested the reset of a password. Please use the following link to reset your password: \n\n ${resetUrl} \n\n This link is valid for 10 minutes. If you did not request this, please ignore this email and your password will remain unchanged.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Password Reset</h1>
        <p>Hello,</p>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e4; margin: 30px 0;">
        <p style="text-align: center; color: #666; font-size: 14px;">This is an automated email, please do not reply.</p>
      </div>
    `,
  });
}; 