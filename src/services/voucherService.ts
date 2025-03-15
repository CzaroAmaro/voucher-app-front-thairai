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

export const getVoucherRealizedByMonthAndYear = (month: number, year: number) => {
    return axios.get(`${baseURL}/by-year-and-month/realized`, {
        params: { month, year },
    });
};

export const getVoucherTwoDates = (day1: number, month1: number, year1: number, day2: number, month2: number, year2: number) => {
    return axios.get(`${baseURL}/between-2-data`, {
        params: {day1, month1, year1, day2, month2, year2},
    });
};

export const addVoucher = (data:{
    paymentMethod: string;
    amount: number;
    note: string;
    howManyDaysAvailable: number;
    place: string;
}) => {
    return axios.post(`${baseURL}`, data);
};

export const realizeVoucher = (code: string, amount: number) => {
    return axios.patch(`${baseURL}/use/${code}`, null,{
        params: {amount:amount},
    });
};

export const editVoucher = (
    id: number,
    data: {
        paymentMethod: string;
        amount: number;
        realized: string;
        realizedDate: string;
        note: string;
        availableAmount: number;
    }
) => {
    return axios.patch(`${baseURL}/${id}`, data);
};

export const deleteVoucher = (id:number, reason: string) => {
    return axios.delete(`${baseURL}/${id}`, {data: reason});
}

export const deleteVoucherPermanently = (id:number) => {
    return axios.delete(`${baseURL}/delete-permanently/${id}`)
}

