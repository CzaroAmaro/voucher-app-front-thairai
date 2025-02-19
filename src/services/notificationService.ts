import axios from "axios";

const baseURL = "http://localhost:8080/api/notification";

export const getNotifications =  () => {
    return axios.get(`${baseURL}`);
};

export const sendEmail = (voucherCode: string, email: string) => {
    return axios.post(`${baseURL}/send`, {voucherCode, email});
};