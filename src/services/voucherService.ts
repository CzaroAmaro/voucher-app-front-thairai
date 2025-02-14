import axios from "axios";

const baseURL = "http://localhost:8080/api";

export const getVouchers =  () => {
    return axios.get(`${baseURL}/vouchers`);
};

export const getVoucherById = (id: number) => {
    return axios.get(`${baseURL}/vouchers/${id}`);
};

export const getVoucherByCode = (code: string) => {
    return axios.get(`${baseURL}/vouchers/by-code/${code}`);
}

export const getDeletedVoucher = () => {
    return axios.get(`${baseURL}/vouchers/deleted`);
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
        params: {amount:amount},
    });
};

export const deleteVoucher = (id:number) => {
    return axios.delete(`${baseURL}/vouchers/${id}`);
}