const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service for TLP Airways
 * Handles all email notifications for booking confirmations, receipts, etc.
 */

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Create email transporter based on environment configuration
   */
  createTransporter() {
    // Production: SendGrid
    if (process.env.SENDGRID_API_KEY) {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    }

    // Production: AWS SES
    if (process.env.AWS_ACCESS_KEY_ID) {
      return nodemailer.createTransport({
        host: `email-smtp.${process.env.AWS_REGION}.amazonaws.com`,
        port: 587,
        secure: false,
        auth: {
          user: process.env.AWS_ACCESS_KEY_ID,
          pass: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
    }

    // Development/Testing: Gmail or other SMTP
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData) {
    try {
      const {
        email,
        pnr,
        passengerName,
        flights,
        passengers,
        totalAmount,
        currency,
        ancillaryServices,
        bookingDate
      } = bookingData;

      const htmlContent = this.generateBookingConfirmationHTML(bookingData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'TLP Airways <noreply@tlpairways.com>',
        to: email,
        subject: `Booking Confirmed - ${pnr} | TLP Airways`,
        html: htmlContent,
        attachments: [
          {
            filename: 'tlp-airways-logo.png',
            path: './assets/logo.png', // Adjust path as needed
            cid: 'logo' // Content ID for embedding in email
          }
        ]
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Booking confirmation email sent:', {
        messageId: info.messageId,
        to: email,
        pnr: pnr
      });

      return {
        success: true,
        messageId: info.messageId,
        email: email
      };

    } catch (error) {
      console.error('❌ Error sending booking confirmation email:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(paymentData) {
    try {
      const {
        email,
        pnr,
        transactionId,
        amount,
        currency,
        paymentMethod,
        paymentDate
      } = paymentData;

      const htmlContent = this.generatePaymentReceiptHTML(paymentData);

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'TLP Airways <noreply@tlpairways.com>',
        to: email,
        subject: `Payment Receipt - ${transactionId} | TLP Airways`,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Payment receipt email sent:', {
        messageId: info.messageId,
        to: email,
        transactionId: transactionId
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Error sending payment receipt email:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate HTML for booking confirmation email
   */
  generateBookingConfirmationHTML(data) {
    const { pnr, passengerName, flights, passengers, totalAmount, currency, ancillaryServices, bookingDate } = data;
    
    // Format flight details
    const onwardFlightHTML = flights.onward ? `
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #1976d2; margin-top: 0;">Onward Flight</h3>
        <p><strong>Flight:</strong> ${flights.onward.flightNumber}</p>
        <p><strong>From:</strong> ${flights.onward.origin} → <strong>To:</strong> ${flights.onward.destination}</p>
        <p><strong>Departure:</strong> ${flights.onward.departureTime}</p>
        <p><strong>Arrival:</strong> ${flights.onward.arrivalTime}</p>
        <p><strong>Duration:</strong> ${flights.onward.duration}</p>
        <p><strong>Class:</strong> ${flights.onward.cabinClass}</p>
      </div>
    ` : '';

    const returnFlightHTML = flights.return ? `
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <h3 style="color: #1976d2; margin-top: 0;">Return Flight</h3>
        <p><strong>Flight:</strong> ${flights.return.flightNumber}</p>
        <p><strong>From:</strong> ${flights.return.origin} → <strong>To:</strong> ${flights.return.destination}</p>
        <p><strong>Departure:</strong> ${flights.return.departureTime}</p>
        <p><strong>Arrival:</strong> ${flights.return.arrivalTime}</p>
        <p><strong>Duration:</strong> ${flights.return.duration}</p>
        <p><strong>Class:</strong> ${flights.return.cabinClass}</p>
      </div>
    ` : '';

    // Format passenger details
    const passengerListHTML = passengers.map((p, index) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.firstName} ${p.lastName}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.gender || 'N/A'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.email || 'N/A'}</td>
      </tr>
    `).join('');

    // Format ancillary services
    const ancillaryHTML = ancillaryServices && ancillaryServices.length > 0 ? `
      <div style="margin: 20px 0;">
        <h3 style="color: #1976d2;">Add-on Services</h3>
        <ul>
          ${ancillaryServices.map(service => `
            <li>${service.name} - ${currency} ${service.price}</li>
          `).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${pnr}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">✈️ TLP Airways</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
        </div>

        <!-- Booking Reference -->
        <div style="background: #fff3cd; padding: 20px; text-align: center; border-left: 5px solid #ffc107;">
          <p style="margin: 0; font-size: 14px; color: #856404;">Booking Reference</p>
          <h2 style="margin: 10px 0 0 0; font-size: 32px; color: #333; letter-spacing: 3px;">${pnr}</h2>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
          
          <p style="font-size: 16px;">Dear ${passengerName},</p>
          
          <p>Thank you for choosing TLP Airways! Your booking has been confirmed. Please find your flight details below:</p>

          ${onwardFlightHTML}
          ${returnFlightHTML}

          <!-- Passenger Details -->
          <div style="margin: 25px 0;">
            <h3 style="color: #1976d2;">Passenger Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #1976d2;">#</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #1976d2;">Name</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #1976d2;">Gender</th>
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #1976d2;">Email</th>
                </tr>
              </thead>
              <tbody>
                ${passengerListHTML}
              </tbody>
            </table>
          </div>

          ${ancillaryHTML}

          <!-- Payment Summary -->
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">Payment Summary</h3>
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span><strong>Total Amount Paid:</strong></span>
              <span style="font-size: 24px; color: #2e7d32; font-weight: bold;">${currency} ${totalAmount.toLocaleString()}</span>
            </div>
            <p style="margin: 5px 0; color: #666; font-size: 14px;">Booking Date: ${new Date(bookingDate).toLocaleString()}</p>
          </div>

          <!-- Important Information -->
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">✈️ Important Information</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
              <li>Please arrive at the airport at least 2 hours before departure for domestic flights and 3 hours for international flights</li>
              <li>Carry a valid government-issued photo ID</li>
              <li>Check-in opens 24 hours before departure</li>
              <li>Baggage allowance: Check your ticket for details</li>
            </ul>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/booking/${pnr}" 
               style="display: inline-block; background: #1976d2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
              View Booking Details
            </a>
          </div>

          <!-- Footer Note -->
          <p style="color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
            Need help? Contact our 24/7 customer support at <a href="mailto:support@tlpairways.com" style="color: #1976d2;">support@tlpairways.com</a>
          </p>

        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} TLP Airways. All rights reserved.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
            This is an automated email. Please do not reply to this email.
          </p>
        </div>

      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for payment receipt email
   */
  generatePaymentReceiptHTML(data) {
    const { pnr, transactionId, amount, currency, paymentMethod, paymentDate } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - ${transactionId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
          <h1>Payment Receipt</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #ddd;">
          
          <h2>Transaction Successful</h2>
          
          <p>Your payment has been successfully processed.</p>

          <table style="width: 100%; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${pnr}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Transaction ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Payment Method:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Amount Paid:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; font-size: 18px; color: #2e7d32;">
                <strong>${currency} ${amount.toLocaleString()}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Date:</strong></td>
              <td style="padding: 10px;">${new Date(paymentDate).toLocaleString()}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; color: #666;">
            Thank you for your payment. A separate email with your booking confirmation has been sent.
          </p>

        </div>

        <div style="background: #f5f5f5; padding: 15px; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #666;">
            © ${new Date().getFullYear()} TLP Airways. All rights reserved.
          </p>
        </div>

      </body>
      </html>
    `;
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(testEmail) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'TLP Airways <noreply@tlpairways.com>',
        to: testEmail,
        subject: 'TLP Airways - Email Configuration Test',
        html: `
          <h2>Email Configuration Test</h2>
          <p>If you're seeing this email, your email configuration is working correctly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Test email sent successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();

