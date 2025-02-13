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

export const realizeVoucher = (code: string, amount: number) => {
    return axios.patch(`${baseURL}/vouchers/use/${code}`, null,{
        params: {ammount:amount},
    });
};