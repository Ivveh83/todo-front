//*todo: implement taskService and call the API
import axios from "axios";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const API_URL = "http://localhost:9090/api";

export const taskService = {
  getAllTodos: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/todo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching All Todos: ", error);
    }
  },
  getPersonById: async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/person/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching Person By Id: ", error);
    }
  },
  getTodoById: async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching Todo By Id: ", error);
    }
  },
  createTodo: async (data) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);

    const { attachments, ...dataWithoutFiles } = data;

    // Skapa FormData
    const formData = new FormData();
    
    // Lägg till JSON-data som en Blob
      formData.append(
        "todo",
        new Blob([JSON.stringify(dataWithoutFiles)], { type: "application/json" })
      );

    // Lägg till filer
    if (attachments?.length > 0) {
      attachments.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await axios.post(`${API_URL}/todo`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data", // Axios sätter detta automatiskt, men det skadar inte att vara explicit
      },
    });

    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    console.log("Error creating Todo", error);
  }
},
  updateTodo: async (data) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      const { attachments, ...dataWithoutFiles } = data;

      console.log("attachments length: ", attachments.length)


      // Skapa FormData
      const formData = new FormData();

      // Lägg till JSON-data som en Blob
      formData.append(
        "todo",
        new Blob([JSON.stringify(dataWithoutFiles)], { type: "application/json" })
      );

      // Lägg till filer om de finns
      if (
        attachments?.length > 0
      ) {
        for (const file of attachments) {
          formData.append("files", file);
        }
      }

      // Skicka PUT-förfrågan
      const response = await axios.put(`${API_URL}/todo/${data.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error updating Todo", error);
    }
  },
  deleteTodo: async (id) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.delete(`${API_URL}/todo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 204) {
        return response.data;
      }
    } catch (error) {
      console.log("Error deleting Todo", error);
    }
  },
  getTodosOverdue: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/todo/overdue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching Todos which are Overdue", error);
    }
  },
};
