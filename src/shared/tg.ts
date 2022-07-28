import config from './config.ts';

export async function sendMessage(chatId: string, title: string, message: string) {
  const tgUrl = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
  try {
    await fetch(tgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${title}: ${message}`
      })
    });
  } catch (e) {
    console.error('Failed to send Telegram message', e);
  }
}
