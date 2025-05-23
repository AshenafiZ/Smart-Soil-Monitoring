require('dotenv').config();
  const { google } = require('googleapis');

  // Debug environment variables
  console.log('Environment variables:', {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Generate authorization URL with explicit parameters
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code',
    scope: ['https://www.googleapis.com/auth/drive.readonly'],
    prompt: 'consent',
  });
  console.log('Visit this URL to authorize:', url);

  // Function to exchange code for tokens
  async function getTokens(code) {
    try {
      const { tokens } = await auth.getToken(code);
      console.log('Tokens:', tokens);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code:', error);
    }
  }

  // Uncomment and replace 'YOUR_CODE' with the code from the redirect URL
  // getTokens('YOUR_CODE');