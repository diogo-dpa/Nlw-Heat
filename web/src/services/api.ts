import axios from "axios";

export const api = axios.create({
	baseURL: "htpp://localhost:4000",
});
