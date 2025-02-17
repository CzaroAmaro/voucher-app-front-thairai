import axios from "axios";

const baseURL = "http://localhost:8080/api/notification";

export const getNotifications =  () => {
    return axios.get(`${baseURL}`);
};