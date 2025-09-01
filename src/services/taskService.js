//*todo: implement taskService and call the API
import axios from "axios";

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_URL = 'http://localhost:9090/api';

export const taskService = {

    getAllTodos: async () => {
        try{
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(`${API_URL}/todo`, { headers: { Authorization: `Bearer ${token}` } });
            if(response.status === 200) {
                return response.data;
            }
        }catch(error) {
            console.log("Error fetching All Todos: ", error);
        }
    },
    getPersonById: async (id) => {
        try{
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.get(`${API_URL}/person/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if(response.status === 200) {
                return response.data;
            }
        }catch(error) {
            console.log("Error fetching Person By Id: ", error);
        }
        },
    createTodo: async (data) => {
        try{
            const token = localStorage.getItem(TOKEN_KEY);
            const response = await axios.post(`${API_URL}/todo`, data, { headers: { Authorization: `Bearer ${token}` } });
            if(response.status === 201) {
                return response.data
            }
        }catch(error) {
            console.log("Error creating Todo", error)
        }
    },
    }

