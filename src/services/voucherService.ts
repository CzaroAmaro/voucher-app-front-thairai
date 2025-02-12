import axios from "axios";

const baseURL = "http://localhost:8080/api";

export const getVouchers =  () => {
    return axios.get(`${baseURL}/vouchers`);
};

export const addVoucher = (data:{
    paymentMethod: string;
    amount: number;
    note: string;
    howManyDaysAvailable: number;
}) => {
    return axios.post(`${baseURL}/vouchers`, data);
};