
// export const BASE_URL = "http://finance-app.test/api/v1";
// export const BASE_URL = "http://cbf3b88a.ngrok.io/api/v1";
export const BASE_URL = "https://psyche-server.herokuapp.com/api/v1";
export const log = (x, mes = "Log") => {
    console.log(mes, ":", x);
    return x;
};
export const TOKEN_NAME = 'app_token';
export const trace = mes => x => log(x, mes);
export const $ = (a) => document.querySelector(a);
export const $$ = (a) => document.querySelectorAll(a);