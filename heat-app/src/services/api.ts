import axios from "axios";

export const api = axios.create({
	baseURL: "http://172.30.32.1:4000",
});
