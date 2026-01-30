import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { log } from '../shared/utils/index.js';
import { LOG_LEVELS } from '../shared/consts/index.js';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
  FRONTEND_URL,
  OTP_EXPIRATION_TIME_MINUTES,
} from '../shared/consts/index.js';
import { EmailOptions } from '../shared/types/index.js';

if (!SMTP_HOST) {
  log({
    message: 'SMTP_HOST is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_HOST is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_PORT) {
  log({
    message: 'SMTP_PORT is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_PORT is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_USER) {
  log({
    message: 'SMTP_USER is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_USER is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_PASS) {
  log({
    message: 'SMTP_PASS is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_PASS is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!SMTP_FROM) {
  log({
    message: 'SMTP_FROM is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'SMTP_FROM is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!FRONTEND_URL) {
  log({
    message: 'FRONTEND_URL is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'FRONTEND_URL is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

if (!OTP_EXPIRATION_TIME_MINUTES) {
  log({
    message:
      'OTP_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    level: LOG_LEVELS.CRITICAL,
  });
  throw new HttpException(
    'OTP_EXPIRATION_TIME_MINUTES is not set in the environment variables',
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        log({
          message: `Email transporter verification failed: ${error.message}`,
          level: LOG_LEVELS.ERROR,
        });
      } else {
        log({
          message: 'Email service is ready to send messages',
          level: LOG_LEVELS.SUCCESS,
        });
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail({
        from: SMTP_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html,
      });

      log({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        message: `Email sent successfully to ${options.to}: ${String(info.messageId)}`,
        level: LOG_LEVELS.SUCCESS,
      });
    } catch (error) {
      log({
        message: `Failed to send email to ${options.to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        level: LOG_LEVELS.ERROR,
      });
      // Don't throw error - email failures should not break the main flow
      // Email is a supplementary feature
    }
  }

  async sendTaskAssignedEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    taskId: string,
    deadline?: Date,
  ): Promise<void> {
    const deadlineText = deadline
      ? `<p><strong>Deadline:</strong> ${deadline.toLocaleString()}</p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 New Task Assigned</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>You have been assigned a new task:</p>
              <h2>${taskTitle}</h2>
              ${deadlineText}
              <p>Please log in to your dashboard to view task details and start working on it.</p>
              <a href="${FRONTEND_URL}/tasks/${taskId}" class="button">View Task</a>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: `New Task Assigned: ${taskTitle}`,
      html,
      text: `Hello ${recipientName},\n\nYou have been assigned a new task: ${taskTitle}\n\nPlease log in to view the details.`,
    });
  }

  async sendTaskApprovedEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    rewardAmount: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .reward { background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 4px; margin: 15px 0; font-size: 24px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Task Approved!</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>Congratulations! Your task has been approved:</p>
              <h2>${taskTitle}</h2>
              <div class="reward">
                💰 You earned: $${rewardAmount}
              </div>
              <p>The reward has been added to your account balance. Keep up the great work!</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: `✅ Task Approved: ${taskTitle}`,
      html,
      text: `Hello ${recipientName},\n\nCongratulations! Your task "${taskTitle}" has been approved.\n\nYou earned: $${rewardAmount}`,
    });
  }

  async sendTaskRejectedEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    feedback: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .feedback { background-color: #fff3cd; border-left: 4px solid #FF9800; padding: 15px; margin: 15px 0; }
            .button { display: inline-block; padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📝 Task Needs Revision</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>Your submission for the following task needs some revision:</p>
              <h2>${taskTitle}</h2>
              <div class="feedback">
                <strong>Feedback from Admin:</strong><br/>
                ${feedback || 'Please review and resubmit your work.'}
              </div>
              <p>Please review the feedback carefully and resubmit your work.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: `📝 Task Needs Revision: ${taskTitle}`,
      html,
      text: `Hello ${recipientName},\n\nYour task "${taskTitle}" needs revision.\n\nFeedback: ${feedback}\n\nPlease review and resubmit.`,
    });
  }

  async sendTaskSubmittedEmail(
    recipientEmail: string,
    recipientName: string,
    taskTitle: string,
    workerName: string,
    taskId: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #9C27B0; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 Task Submitted for Review</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>A task has been submitted for your review:</p>
              <h2>${taskTitle}</h2>
              <p><strong>Submitted by:</strong> ${workerName}</p>
              <p>Please review the submission and provide feedback.</p>
              <a href="${FRONTEND_URL}/tasks/${taskId}" class="button">Review Task</a>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: `📬 Task Submitted: ${taskTitle}`,
      html,
      text: `Hello ${recipientName},\n\nTask "${taskTitle}" has been submitted by ${workerName} and is ready for review.`,
    });
  }

  async sendPaymentRecordedEmail(
    recipientEmail: string,
    recipientName: string,
    amount: string,
    taskTitle?: string,
  ): Promise<void> {
    const taskText = taskTitle
      ? `<p><strong>Related task:</strong> ${taskTitle}</p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .amount { background-color: #4CAF50; color: white; padding: 15px; text-align: center; border-radius: 4px; margin: 15px 0; font-size: 24px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💸 Payment Recorded</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>A payment has been recorded to your account:</p>
              <div class="amount">
                $${amount}
              </div>
              ${taskText}
              <p>The amount has been added to your balance and is ready for withdrawal.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: '💸 Payment Recorded',
      html,
      text: `Hello ${recipientName},\n\nA payment of $${amount} has been recorded to your account.`,
    });
  }

  async sendWorkerJoinedEmail(
    recipientEmail: string,
    recipientName: string,
    workerEmail: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3F51B5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 New Worker Joined</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>A new worker has joined the platform:</p>
              <p><strong>Email:</strong> ${workerEmail}</p>
              <p>You can now assign tasks to this worker.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: '👋 New Worker Joined',
      html,
      text: `Hello ${recipientName},\n\nA new worker has joined: ${workerEmail}`,
    });
  }

  async sendOTPEmail(recipientEmail: string, otp: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .otp { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 4px; margin: 15px 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
            .warning { color: #f44336; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Your Login Code</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Use the following code to log in to your account:</p>
              <div class="otp">${otp}</div>
              <p>This code will expire in ${OTP_EXPIRATION_TIME_MINUTES} minutes.</p>
              <p class="warning"><strong>⚠️ Important:</strong> Do not share this code with anyone. Our team will never ask you for this code.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: 'Your Login Code',
      html,
      text: `Your login code is: ${otp}\n\nThis code will expire in ${OTP_EXPIRATION_TIME_MINUTES} minutes.`,
    });
  }

  async sendWelcomeEmail(
    recipientEmail: string,
    recipientName: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
            .footer { margin-top: 20px; text-align: center; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Gamified Task Manager!</h1>
            </div>
            <div class="content">
              <p>Hello ${recipientName},</p>
              <p>Welcome to the Gamified Task Manager platform!</p>
              <p>You're all set to start earning by completing tasks. Here's what you can do:</p>
              <ul>
                <li>📋 Complete assigned tasks and earn rewards</li>
                <li>⭐ Level up by accumulating XP points</li>
                <li>💰 Track your earnings and request withdrawals</li>
                <li>🏆 Unlock higher-value tasks as you progress</li>
              </ul>
              <p>Log in to your dashboard to get started!</p>
              <a href="${FRONTEND_URL}/login" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
              <p>This is an automated message from Gamified Task Manager. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: recipientEmail,
      subject: '🎉 Welcome to Gamified Task Manager!',
      html,
      text: `Hello ${recipientName},\n\nWelcome to Gamified Task Manager! You're all set to start earning by completing tasks.`,
    });
  }
}
