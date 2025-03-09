const nodemailer = require('nodemailer');

/**
 * Skickar ett verifikationsmail till användaren
 * 
 * @param {object} req - HTTP-förfrågan
 * @param {object} res - HTTP-svar
 */
module.exports = async (req, res) => {
  // Endast tillåt POST-förfrågningar
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoden är inte tillåten' });
  }

  try {
    const { email, username, verificationCode } = req.body;

    // Validera att alla nödvändiga fält finns
    if (!email || !username || !verificationCode) {
      return res.status(400).json({ error: 'E-post, användarnamn och verifikationskod krävs' });
    }

    // Skapa transporter för e-post (använder miljövariabler för säkerheten)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true för 465, false för andra portar
      auth: {
        user: process.env.EMAIL_USER, // vanligen 'apikey' för SendGrid
        pass: process.env.EMAIL_PASSWORD // API-nyckel
      }
    });

    // Skapa e-postmeddelande
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"GoBet Team" <noreply@gobet.com>',
      to: email,
      subject: 'Verifiera ditt GoBet-konto',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #6643b5; margin-bottom: 5px;">GoBet</h1>
            <p style="color: #5d6977; font-size: 16px;">Din plattform för betting med vänner</p>
          </div>
          
          <div style="background-color: #f5f7fb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #2b3240; margin-top: 0;">Hej ${username}!</h2>
            <p style="color: #5d6977; font-size: 15px; line-height: 1.5;">Tack för att du registrerar dig på GoBet. För att slutföra din registrering, vänligen verifiera din e-postadress med koden nedan:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #6643b5; padding: 15px; background-color: #ffffff; border-radius: 8px; display: inline-block; border: 1px solid #e5e7eb;">
                ${verificationCode}
              </div>
            </div>
            
            <p style="color: #5d6977; font-size: 15px; line-height: 1.5;">Koden är giltig i 10 minuter. Om du inte begärt denna verifikation, vänligen ignorera detta meddelande.</p>
          </div>
          
          <div style="color: #5d6977; font-size: 14px; text-align: center;">
            <p>Har du frågor? Kontakta vår support på <a href="mailto:support@gobet.com" style="color: #6643b5; text-decoration: none;">support@gobet.com</a></p>
            <p style="margin-top: 20px; color: #a0a0a0;">&copy; ${new Date().getFullYear()} GoBet. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      `
    };

    // Skicka e-postmeddelandet
    await transporter.sendMail(mailOptions);

    // Returnera framgångssvar
    return res.status(200).json({ success: true, message: 'Verifikationskod skickad' });
  } catch (error) {
    console.error('Fel vid sändning av verifikationsmail:', error);
    return res.status(500).json({ error: 'Kunde inte skicka verifikationsmail', details: error.message });
  }
}; 