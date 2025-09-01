import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { taskService } from "../services/taskService.js";
import { authService } from "../services/authService.js";

const Task = () => {
  // todo*: make this component functional by implementing state management and API calls

  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin(currentUser);

  const defaultFormValues = {
    title: "",
    description: "",
    dueDate: "",
    personId: "",
    numberOfAttachments: [],
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const onSubmit = async (data) => {
    // hämta data
    //lägg till ytterligare poster i data
    console.log("Before: ", { ...data });
    data.numberOfAttachments = data.numberOfAttachments.length;
    if (taskToEdit) {
      data.updatedAt = new Date().toISOString();
      await taskService.updateTodo(data);
    } else {
      data.completed = false;
      data.createdAt = new Date().toISOString();
      await taskService.createTodo(data);
    }
    console.log("Reset without taskToEdit");
    setTaskToEdit(null);
    console.log("After: ", data);
    setUpdateTaskList(!updateTaskList);
  };

  const [tasks, setTasks] = useState([]);
  const [updateTaskList, setUpdateTaskList] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      console.log("Reset with taskToEdit");
      reset(taskToEdit);
    } else {
      reset(defaultFormValues);
    }
  }, [taskToEdit, reset]);

  useEffect(() => {
    const fetchAllTodosWithRespectiveUser = async () => {
      try {
        const data = await taskService.getAllTodos();

        const tasksWithAssignee = await Promise.all(
          data.map(async (task) => ({
            ...task,
            assignee: task.personId
              ? await taskService.getPersonById(task.personId)
              : {},
          }))
        );

        setTasks(tasksWithAssignee);
        console.log("Tasks: ", tasksWithAssignee);
      } catch (error) {
        console.error("Error fetching Todos:", error);
      }
    };
    fetchAllTodosWithRespectiveUser();
  }, [updateTaskList]);

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={false} onClose={() => {}} />
      <main className="dashboard-main">
        <Header
          title="Tasks"
          subtitle="Manage and organize your tasks"
          onToggleSidebar={() => {}}
        />

        <div className="dashboard-content">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card shadow-sm task-form-section">
                <div className="card-body">
                  <h2 className="card-title mb-4">Add New Task</h2>
                  <form id="todoForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                      <label htmlFor="todoTitle" className="form-label">
                        Title
                      </label>
                      <small className="text-danger">
                        {errors.title && errors.title.message}&nbsp;
                      </small>
                      <input
                        type="text"
                        className="form-control"
                        id="todoTitle"
                        {...register("title", { required: " is required" })}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="todoDescription" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="todoDescription"
                        rows="3"
                        {...register("description")}
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="todoDueDate" className="form-label">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="todoDueDate"
                          {...register("dueDate")}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="todoPerson" className="form-label">
                          Assign to Person
                        </label>
                        <select
                          className="form-select"
                          id="todoPerson"
                          {...register("personId")}
                        >
                          <option value="">
                            -- Select Person (Optional) --
                          </option>
                          <option value="2">Mehrdad Javan</option>
                          <option value="3">Simon Elbrink</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <div className="input-group mb-3">
                        <input
                          type="file"
                          className="form-control"
                          id="todoAttachments"
                          multiple
                          {...register("numberOfAttachments")}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                      <div className="file-list" id="attachmentPreview"></div>
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="submit"
                        className={`btn ${
                          taskToEdit ? "btn-success" : "btn-primary"
                        }`}
                      >
                        <i className="bi bi-plus-lg me-2"></i>
                        {taskToEdit ? "Update Task" : "Add Task"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm tasks-list mt-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Tasks</h5>
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      title="Filter"
                    >
                      <i className="bi bi-funnel"></i>
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      title="Sort"
                    >
                      <i className="bi bi-sort-down"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {/* Tasks */}
                    {tasks &&
                      tasks.map((task) => (
                        <div
                          className="list-group-item list-group-item-action"
                          key={task.id}
                        >
                          <div className="d-flex w-100 justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between">
                                <h6 className="mb-1">{task.title}</h6>
                                <small className="text-muted ms-2">
                                  Created:{" "}
                                  {task.createdAt
                                    ? task.createdAt.slice(0, 10)
                                    : "Undefined"}
                                </small>
                              </div>
                              <p className="mb-1 text-muted small">
                                {task.description}
                              </p>
                              <div className="d-flex align-items-center flex-wrap">
                                <small className="text-muted me-2">
                                  <i className="bi bi-calendar-event"></i> Due:{" "}
                                  {task.dueDate
                                    ? task.dueDate.slice(0, 10)
                                    : "Undefined"}
                                </small>
                                <span className="badge bg-info me-2">
                                  <i className="bi bi-person"></i>{" "}
                                  {task.assignee?.name || "Unassigned"}
                                </span>
                                <span
                                  className={`badge me-2 ${
                                    task.completed
                                      ? "bg-success"
                                      : "bg-warning text-dark"
                                  }`}
                                >
                                  {task.completed ? "Completed" : "Pending"}
                                </span>
                              </div>
                            </div>
                            <div className="btn-group ms-3">
                              <button
                                className="btn btn-outline-success btn-sm"
                                title="Complete"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                title="Edit"
                                onClick={() => setTaskToEdit(task)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className={`btn btn-sm ${
                                  isAdmin
                                    ? "btn-outline-danger"
                                    : "btn-secondary"
                                }`}
                                title="Delete"
                                disabled={!isAdmin}
                                onClick={async () => {
                                  await taskService.deleteTodo(task.id);
                                  setUpdateTaskList(!updateTaskList);
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Task;
