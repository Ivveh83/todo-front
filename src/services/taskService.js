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

      // Cerate FormData
      const formData = new FormData();

      // Add JSON-data as a Blob under "todo"
      formData.append(
        "todo",
        new Blob([JSON.stringify(dataWithoutFiles)], {
          type: "application/json",
        })
      );

      // Add "files"
      if (attachments?.length > 0) {
        attachments.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axios.post(`${API_URL}/todo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Axios sets this automatic, but it doesn't hurt to be explicit
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

      console.log("attachments length: ", attachments.length);

      // Create FormData
      const formData = new FormData();

      // Add JSON-data as a Blob under "todo"
      formData.append(
        "todo",
        new Blob([JSON.stringify(dataWithoutFiles)], {
          type: "application/json",
        })
      );

      // add "files" if exists
      if (attachments?.length > 0) {
        for (const file of attachments) {
          formData.append("files", file);
        }
      }

      // Send PUT-request
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
  fetchTodosOverdue: async () => {
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
  fetchTodosByPerson: async (personId) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/todo/person/${personId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching Todos by Person", error);
      throw error;
    }
  },
  fetchTodosByStatus: async (status) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await axios.get(`${API_URL}/todo/status?completed=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      console.log("Error fetching Todos by Status", error);
      throw error;
    }
  },
  sortTasks: (tasks, sortBy) => {
  switch (sortBy) {
    case 'titleA-Z':
      return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
    case 'titleZ-A':
      return [...tasks].sort((a, b) => b.title.localeCompare(a.title));
    case 'dueDateAscending':
      return [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    case 'dueDateDescending':
      return [...tasks].sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    case 'taskDone':
      return [...tasks].sort((a, b) => b.completed - a.completed);
    case 'taskNotDone':
      return [...tasks].sort((a, b) => a.completed - b.completed);
    case 'createdAt':
      return [...tasks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    default:
      return tasks;
  }
},
};
