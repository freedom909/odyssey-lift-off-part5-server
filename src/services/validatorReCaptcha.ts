import axios from 'axios';
export function validatorReCaptcha(token: string){
    return axios.post('https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}',
    {},
    {
        headers:{'Content-Type':'application/x-www-form-urlencoded; charset=utf-8'}
    })
}