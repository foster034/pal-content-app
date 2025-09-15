import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, clientInfo, shareableUrl, customMessage } = body;

    // Validate required fields
    if (!reportId || !clientInfo || !shareableUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { name, phone, email, preferredContactMethod } = clientInfo;

    // Default message template
    const defaultMessage = `Hi ${name}! Your Pop-A-Lock service is complete. View your job report and leave a review: ${shareableUrl}`;
    const messageToSend = customMessage || defaultMessage;

    let deliveryResult = null;
    let fallbackUsed = false;

    try {
      switch (preferredContactMethod) {
        case 'sms':
          // Send SMS using Twilio
          deliveryResult = await sendSMS(phone, messageToSend);
          
          // If SMS fails and email is available, try email as fallback
          if (!deliveryResult.success && email) {
            console.log(`📧 SMS failed, attempting email fallback for ${name}`);
            deliveryResult = await sendEmail(email, name, shareableUrl, messageToSend);
            fallbackUsed = true;
          }
          break;
          
        case 'email':
          // Send email
          deliveryResult = await sendEmail(email, name, shareableUrl, messageToSend);
          
          // If email fails and phone is available, provide phone fallback guidance
          if (!deliveryResult.success && phone) {
            console.log(`📞 Email failed, providing phone fallback for ${name}`);
            deliveryResult = {
              success: true,
              method: 'phone',
              message: 'Email failed - franchisee should call client manually',
              phoneNumber: phone,
              fallback: true
            };
            fallbackUsed = true;
          }
          break;
          
        case 'phone':
          // For phone calls, we'll just log the request and provide phone number
          // The franchisee will need to make the call manually
          deliveryResult = {
            success: true,
            method: 'phone',
            message: 'Phone call scheduled - franchisee should call client manually',
            phoneNumber: phone
          };
          break;
          
        default:
          throw new Error(`Unsupported contact method: ${preferredContactMethod}`);
      }

      // Log the delivery attempt
      const deliveryRecord = {
        reportId,
        clientName: name,
        method: preferredContactMethod,
        recipient: preferredContactMethod === 'sms' ? phone : email,
        status: deliveryResult.success ? 'sent' : 'failed',
        sentAt: new Date().toISOString(),
        details: deliveryResult
      };

      console.log('Job report delivery:', deliveryRecord);

      // In a real implementation:
      // 1. Save delivery record to database
      // 2. Update report status
      // 3. Track client engagement

      return NextResponse.json(
        { 
          success: deliveryResult.success,
          method: deliveryResult.method || preferredContactMethod,
          originalMethod: preferredContactMethod,
          fallbackUsed: fallbackUsed,
          recipient: deliveryResult.method === 'phone' ? phone : (deliveryResult.method === 'email' ? email : phone),
          message: deliveryResult.message || 'Report sent successfully',
          deliveryId: deliveryRecord.reportId,
          phoneNumber: deliveryResult.phoneNumber
        },
        { status: 200 }
      );

    } catch (deliveryError) {
      console.error('Delivery error:', deliveryError);
      
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to send via ${preferredContactMethod}`,
          details: deliveryError instanceof Error ? deliveryError.message : 'Unknown delivery error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending job report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to send SMS via Twilio
async function sendSMS(phoneNumber: string, message: string) {
  try {
    const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/twilio/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message: message,
        userType: 'franchisee',
        userId: 1,
        userName: 'System'
      }),
    });

    const smsResult = await smsResponse.json();

    if (smsResult.success) {
      return {
        success: true,
        method: 'sms',
        message: smsResult.testMode ? 'SMS sent in test mode' : 'SMS sent successfully',
        messageId: smsResult.messageSid || smsResult.simulatedSid,
        testMode: smsResult.testMode
      };
    } else {
      throw new Error(smsResult.error || 'SMS sending failed');
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      method: 'sms',
      message: `SMS delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Helper function to send email
async function sendEmail(email: string, clientName: string, reportUrl: string, message: string) {
  try {
    // In a real implementation, you'd use an email service like SendGrid, AWS SES, etc.
    
    const emailContent = {
      to: email,
      subject: 'Your Pop-A-Lock Service Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
            <h1>Service Complete! 🔧</h1>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <p>Hi ${clientName},</p>
            
            <p>Great news! Your Pop-A-Lock service has been completed successfully.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportUrl}" 
                 style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                📄 View Your Service Report
              </a>
            </div>
            
            <p>In your report, you'll find:</p>
            <ul>
              <li>✅ Complete service details</li>
              <li>📸 Before and after photos</li>
              <li>🎯 Technician notes</li>
              <li>⭐ Option to leave a review</li>
            </ul>
            
            <p>We'd love to hear about your experience! Please consider leaving us a Google review to help other customers discover our services.</p>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; text-align: center; color: #0369a1;">
                <strong>Questions about your service?</strong><br>
                Contact us anytime - we're here to help!
              </p>
            </div>
            
            <p>Thank you for choosing Pop-A-Lock!</p>
            
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
              Report URL: <a href="${reportUrl}">${reportUrl}</a>
            </p>
          </div>
        </div>
      `
    };

    // Mock email sending
    console.log(`Email sent to ${email}:`, emailContent);
    
    return {
      success: true,
      method: 'email',
      message: 'Email sent successfully',
      messageId: `EMAIL-${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      method: 'email',
      message: `Email delivery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}