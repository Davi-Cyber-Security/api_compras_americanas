import { sendMessageEmail } from '../util/sendMessageEmail.util.js';
import { getUsersEmail } from '../repositories/users.repositories.js';
import { hasVotedToday } from '../repositories/voting.repositories.js';

const BR_NOW_TIME = `TIME(CONVERT_TZ(NOW(), '+00:00', '-03:00'))`;

export async function sendWarningMessage(){
    const emails = await getUsersEmail();
    for(const email of emails){
        const hasVoted = await hasVotedToday(email.id);
        if(!hasVoted || (hasVoted && hasVoted.vote_time < BR_NOW_TIME)){
            if(getBrazilNow().getHours() < 18){
                setTimeout(async () => {
                    await sendMessageEmail(email.email, 'Aviso de votação', `Você ainda não votou hoje. Acesse o link para votar: https://compras-americanas.vercel.app/login`);
                }, 1000 * 60 * 60 * 1);
            } else {
                await sendMessageEmail(email.email, 'Aviso de votação', `Você ainda não votou hoje. Acesse o link para votar: https://compras-americanas.vercel.app/login`);
            }
        }
    }
}