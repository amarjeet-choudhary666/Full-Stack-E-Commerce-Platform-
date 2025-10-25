import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter only if email credentials are provided
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_app_specific_password_here') {
    console.warn('Email service not configured. Email notifications will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "amarjeetchoudhary647@gmail.com",
      pass: "kfodylaenbisnmgk"
    }
  });
};

const transporter = createTransporter();

export const sendVerificationEmail = async (email: string, token: string) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping verification email.');
    return;
  }

  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      html: `
        <h2>Welcome! Please verify your email</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 10 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't throw error, just log it
  }
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (!transporter) {
    console.log('Email service not configured. Skipping password reset email.');
    return;
  }

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};