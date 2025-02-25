import axios from "axios";

const baseURL = "http://localhost:8080/api/vouchers";

export const getVouchers =  () => {
    return axios.get(`${baseURL}`);
};

export const getVoucherById = (id: number) => {
    return axios.get(`${baseURL}/${id}`);
};

export const getVoucherByCode = (code: string) => {
    return axios.get(`${baseURL}/by-code/${code}`);
}

export const getVoucherByPartOfCode = (code: string) => {
    return axios.get(`${baseURL}/by-part-of-code/${code}`);
}

export const getDeletedVoucher = () => {
    return axios.get(`${baseURL}/deleted`);
};
export const getVoucherByMonthAndYear = (month: number, year: number) => {
    return axios.get(`${baseURL}/by-year-and-month`, {
        params: { month, year },
    });
};

export const addVoucher = (data:{
    paymentMethod: string;
    amount: number;
    note: string;
    howManyDaysAvailable: number;
}) => {
    return axios.post(`${baseURL}`, data);
};

export const realizeVoucher = (code: string, amount: number) => {
    return axios.patch(`${baseURL}/use/${code}`, null,{
        params: {amount:amount},
    });
};

export const deleteVoucher = (id:number, reason: string) => {
    return axios.delete(`${baseURL}/${id}`, {data: reason});
}

export const deleteVoucherPermanently = (id:number) => {
    return axios.delete(`${baseURL}/delete-permanently/${id}`)
}