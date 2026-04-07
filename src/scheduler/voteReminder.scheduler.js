import cron from 'node-cron';
import { getUsersWhoNotVotedToday } from '../repositories/users.repositories.js';
import { sendMessageEmail } from '../util/sendMessageEmail.util.js';

function buildReminderHtml(email, message) {
    return `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8f9fa; border-radius: 12px;">
            <h2 style="color: #6c5ce7; margin-bottom: 8px;">🗳️ Lembrete de Votação</h2>
            <p style="color: #2d3436;">Olá, <strong>${email}</strong>!</p>
            <p style="color: #636e72;">${message}</p>
            <div style="margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL || 'https://compras-americanas.vercel.app'}/app/votar"
                   style="background: #6c5ce7; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                    Votar agora
                </a>
            </div>
            <p style="color: #b2bec3; font-size: 0.8rem;">A votação encerra às 18:00 (horário de Brasília).</p>
        </div>
    `;
}

const MESSAGES = {
    '08': 'Bom dia! A votação de hoje está aberta. Escolha o produto que vamos levar para a faculdade!',
    '12': 'Boa tarde! Já passou da metade do dia e você ainda não votou. Corre lá!',
    '15': 'Já são 15h! Você ainda não votou hoje. Faltam apenas 3 horas para o encerramento.',
    '17': '⏰ Último aviso! A votação encerra em 1 hora (18:00). Vote agora!',
};

function isBrazilWeekend() {
    const brString = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const brNow = new Date(brString);
    const day = brNow.getDay();
    return day === 0 || day === 6;
}

async function sendReminders(hour) {
    if (isBrazilWeekend()) {
        console.log(`[Lembrete ${hour}h] Final de semana, envio cancelado.`);
        return;
    }

    try {
        const users = await getUsersWhoNotVotedToday();
        if (users.length === 0) return;

        console.log(`[Lembrete ${hour}h] Enviando para ${users.length} usuário(s)...`);

        for (const user of users) {
            try {
                await sendMessageEmail(
                    user.email,
                    `🗳️ Lembrete: Vote agora! (${hour}h)`,
                    buildReminderHtml(user.email, MESSAGES[hour])
                );
            } catch (err) {
                console.error(`Erro ao enviar para ${user.email}:`, err.message);
            }
        }

        console.log(`[Lembrete ${hour}h] Concluído.`);
    } catch (err) {
        console.error(`[Lembrete ${hour}h] Erro:`, err.message);
    }
}

export function startScheduler() {
    // 08:00 horário de Brasília = 11:00 UTC
    cron.schedule('0 11 * * *', () => sendReminders('08'), { timezone: 'UTC' });

    // 12:00 horário de Brasília = 15:00 UTC
    cron.schedule('0 15 * * *', () => sendReminders('12'), { timezone: 'UTC' });

    // 15:00 horário de Brasília = 18:00 UTC
    cron.schedule('0 18 * * *', () => sendReminders('15'), { timezone: 'UTC' });

    // 17:00 horário de Brasília = 20:00 UTC
    cron.schedule('0 20 * * *', () => sendReminders('17'), { timezone: 'UTC' });

    console.log('Scheduler de lembretes iniciado.');
}
