const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const sgMail = require('@sendgrid/mail');


const secretsManager = new SecretsManagerClient();


const sendVerificationEmail = async (userDetails, secrets) => {
    const msg = {
        to: userDetails.email,
        from: secrets.from_email,
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

        // Get SendGrid credentials from Secrets Manager
        const command = new GetSecretValueCommand({
            SecretId: process.env.SECRETS_ARN
        });
        
        const response = await secretsManager.send(command);
        const secrets = JSON.parse(response.SecretString);
        
        console.log('Secrets retrieved successfully');
        
        // Initialize SendGrid with API key from secrets
        sgMail.setApiKey(secrets.api_key);

        const message = JSON.parse(event.Records[0].Sns.Message);
        console.log('SNS message parsed:', message);
        
        // Send verification email using secrets
        await sendVerificationEmail(message, secrets);

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