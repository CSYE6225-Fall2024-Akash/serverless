const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (userDetails) => {
    const msg = {
        to: userDetails.email,
        from: process.env.FROM_EMAIL,
        subject: 'Verify Your Email Address',
        text: `Dear ${userDetails.firstName},\n\nPlease verify your email address by clicking the following link: ${userDetails.verificationUrl}\n\nThis link will expire in 2 minutes.\n\nBest regards,\nYour Application Team`,
        html: `
            <p>Dear ${userDetails.firstName},</p>
            <p>Please verify your email address by clicking the following link:</p>
            <p><a href="${userDetails.verificationUrl}">Verify Email</a></p>
            <p>This link will expire in 2 minutes.</p>
            <p>Best regards,<br>Your Application Team</p>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`Verification email sent to ${userDetails.email}`);
    } catch (error) {
        console.error('SendGrid error:', error);
        throw error;
    }
};

exports.handler = async (event) => {
    try {
        console.log('Event received:', event);
        const message = JSON.parse(event.Records[0].Sns.Message);
        
        // Send verification email
        await sendVerificationEmail(message);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Verification email sent successfully'
            })
        };
    } catch (error) {
        console.error('Error processing verification:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing verification',
                error: error.message
            })
        };
    }
};