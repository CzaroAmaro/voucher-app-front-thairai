import axios from "axios";

const baseURL = "http://localhost:8080/api/pdf";

export const getReport =  (month: number, year: number) => {
    return axios.get(`${baseURL}/report`, {
        params: {month, year},
        responseType: "blob"
    });
};

export const generateReportList = (voucherIds: number[]) => {
    return axios.post(`${baseURL}/report-list`, voucherIds, { responseType: "blob" });
};