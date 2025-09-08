import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import { taskService } from "../services/taskService.js";
import { authService } from "../services/authService.js";

const Task = () => {
  // todo*: make this component functional by implementing state management and API calls
  // todo1: implement validation for attachments, max 5 items and each item max 2MB, and demonstrate ev. errors - DONE
  // toto1.1 Read about Controller element - DONE
  // todo2: implement functionality to show each file in attachments - DONE
  // todo3: make dueDate optional - DONE
  // todo4: reset attachment input after adding/updating task - DONE
  // todo5: Rewrite logics to only make api call to fetchAllTodos when creating new todo, when updating todo, send api call to backend to update it in db, but
  // don't call api to fetchAllTodos again, instead update state, tasks, with that updated todo - REJECTED: Not logic, because other users might have have
  // added tasks inbetween time, and we wan't the latest data in db. Could implement a lazy loading UI button to fetch latest data only when pressing that button,
  // but I think that would just be anoying to remember to press and affect UX negativly :-)
  // todo6: Implement complete button - DONE
  // todo7: Create button to demonstrate Person, apply lazy loading
  // todo8: Apply getTodosOverdue on button Show Overdue Tasks - DONE
  // todo9: Implement functionality to retrieve all todos for a specific person - DONE
  //      - fetch functionality
  //      - Button
  //        - How to Get Persons? Initially go with hard coded variant, later implement it dynamically
  // todo10: Implement status "In-Progress" - DONE
  // todo11: Deleting existing attachement is not possible at the moment, since if I send an empty array in the put request, backend will not delete it.
  // Backend is designed at the moment to only accept FormData, not JSON. When updating task, if no change is made to attachment file, it will not be sent to
  // backend.
  // In the backend, attachments will therefore be null in the TodoController. Later in the TodoServiceImpl, if the todo attachments is null or empty it will,
  // of course, not be updated, and the existing attachments attached to the todo will be saved along with the todo. This happens as well when sending an empty
  // array to the backend, so delete the array in frontend and send it to backend will have no effect.
  //    - How to fix it?
  // todo12: Implement a button to call getTodoByPerson and show todo person in the task list, i.e. apply lazy loading for showing person.

  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin(currentUser);

  const defaultFormValues = {
    title: "",
    description: "",
    dueDate: "",
    personId: "",
    attachments: [],
  };

  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    defaultValues: defaultFormValues,
  });

  const attachmentsWatch = watch("attachments");

  const onSubmit = async (data) => {
    console.log("Before: ", { ...data });
    // Lägg till fält
    data.numberOfAttachments = data.attachments?.length || 0;
    console.log("data.numberOfAttachments: ", data.numberOfAttachments);
    if (taskToEdit) {
      data.updatedAt = new Date().toISOString();
      await taskService.updateTodo(data);
      setTaskToEdit(null);
    } else {
      data.completed = false;
      data.createdAt = new Date().toISOString();
      await taskService.createTodo(data);
    }
    console.log("After: ", data);
    reset(defaultFormValues);
    if (fileInputRef.current) {
      //
      fileInputRef.current.value = ""; // manually empties file input
    }
    setUpdateTaskList((prev) => !prev);
  };

  const [tasks, setTasks] = useState([]);
  const [persons, setPersons] = useState([]);
  const [updateTaskList, setUpdateTaskList] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [getTodosOverdue, setGetTodosOverdue] = useState(false);
  const [submenuTodosByPersonOpen, setSubmenuTodosByPersonOpen] =
    useState(false);
  const [submenuTodosByStatusOpen, setSubmenuTodosByStatusOpen] =
    useState(false);
  const [getTodosByPerson, setGetTodosByPerson] = useState(0);
  const [getTodosByStatus, setGetTodosByStatus] = useState(null);

  useEffect(() => {
    if (taskToEdit) {
      console.log("Reset with taskToEdit");
      reset(taskToEdit);
    } else {
      reset(defaultFormValues);
    }
  }, [taskToEdit, reset]);

  useEffect(() => {
    const fetchTodosWithRespectiveUser = async () => {
      try {
        let data;
        if (getTodosOverdue) {
          data = await taskService.fetchTodosOverdue();
          console.log("Overdue Tasks: ", data);
          setGetTodosOverdue(false);
        } else if (getTodosByPerson !== 0) {
          data = await taskService.fetchTodosByPerson(getTodosByPerson);
          console.log("Tasks by Person: ", data);
          setGetTodosByPerson(0);
        } else if (getTodosByStatus === true || getTodosByStatus === false) {
          data = await taskService.fetchTodosByStatus(getTodosByStatus);
          console.log("Tasks by Status: ", data);
          setGetTodosByStatus(null);
        } else {
          data = await taskService.getAllTodos();
        }

        {
          /*const tasksWithAssignee = await Promise.all(
          data.map(async (task) => ({
            ...task,
            assignee: task.personId
              ? await taskService.getPersonById(task.personId)
              : {},
          }))
        );*/
        }
        const tasksWithAssignee = data.map((task) => ({
          ...task,
          assignee: persons.some((person) => person.id === task.personId)
            ? persons.find((person) => person.id === task.personId)
            : {},
        }));

        setTasks(tasksWithAssignee);
        console.log("TasksWithAssignee: ", tasksWithAssignee);
      } catch (error) {
        console.error("Error fetching Todos:", error);
      }
    };
    fetchTodosWithRespectiveUser();
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
                  <h2 className="card-title mb-4">
                    {taskToEdit ? "Update Task" : "Add New Task"}
                  </h2>
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
                        <small className="text-danger">
                          {errors.dueDate && errors.dueDate.message}&nbsp;
                        </small>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="todoDueDate"
                          {...register("dueDate", {
                            validate: (value) => {
                              if (!value) return true;
                              if (taskToEdit) {
                                const createdAt = new Date(
                                  taskToEdit.createdAt
                                );
                                createdAt.setHours(0, 0, 0, 0);
                                const selected = new Date(value);
                                return (
                                  selected >= createdAt ||
                                  " cannot be before creation date"
                                );
                              } else {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0); // nollställ tid
                                const selected = new Date(value);
                                return (
                                  selected >= today || " cannot be in the past"
                                );
                              }
                            },
                          })}
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
                      <small className="text-danger">
                        {errors.attachments && errors.attachments.message}&nbsp;
                      </small>
                      <div className="input-group mb-3">
                        <Controller // Controller is a React Component that takes propts, i.e. name, control, default value, rules, render.
                          // It provides more controll than register on what will be saved to formState.
                          name="attachments" // This will be the name for the Key in formState.
                          control={control} // Connects Controller with useForm, kind of the same function register has.
                          defaultValue={[]}
                          rules={{
                            //Is the equivalent to validate in register.
                            validate: (files) => {
                              if (!files) return true; // no files → skips validation
                              // otherwise validation runs
                              if (files.length > 5)
                                return " can't have more than 5 files";
                              const maxMB = 2;
                              const tooLarge = files.some(
                                (file) => file.size / 1024 / 1024 > maxMB
                              );
                              if (tooLarge)
                                return ` each file must be max ${maxMB} MB`;
                              return true; // all are ok
                            },
                          }}
                          render={(
                            { field, fieldState } // Render creates a js-object, field, that has some fields (name and value, i.e. will later be key/value in formState) -
                          ) => (
                            // and some methods (onChange) to connect the input element to formState. It also decides the UI of the component.
                            <>
                              <input
                                type="file"
                                multiple
                                ref={fileInputRef} //Connection to instance of useRef.
                                className="form-control"
                                onChange={(e) => {
                                  const filesArray = Array.from(e.target.files);
                                  field.onChange(filesArray); // This mehtod sets the Key/Value for this field in formState
                                  console.log("filesArray:", filesArray);
                                }}
                              />
                              {/*{fieldState.error && (
        <small className="text-danger">{fieldState.error.message}</small>
      )}*/}
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => {
                                  console.log(
                                    "Attachment reset button clicked"
                                  );
                                  field.onChange(null);
                                }}
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                        />
                      </div>
                      <div className="file-list" id="attachmentPreview">
                        {attachmentsWatch?.length > 0 && (
                          <ul>
                            {attachmentsWatch.map((file, index) => (
                              <li
                                key={index}
                                className="list-group-item d-flex justify-content-between align-items-center"
                              >
                                {/* Display either if it's a real file from the input or metadata from backend  */}
                                {"name" in file
                                  ? `${file.name} (${(
                                      file.size /
                                      1024 /
                                      1024
                                    ).toFixed(2)} MB)`
                                  : `${file.fileName} (${(
                                      atob(file.data).length /
                                      1024 /
                                      1024
                                    ).toFixed(2)} MB)`}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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

                  {/*Filter Buttons*/}
                  <div className="btn-group">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      title="Filter"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-funnel"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <span className="mx-2">Filter by:</span>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setGetTodosOverdue(true);
                            setUpdateTaskList((prev) => !prev);
                          }}
                        >
                          <i className="bi bi-calendar-x me-2"></i>
                          Show Overdue Tasks
                        </button>
                      </li>
                      {/* Hover submenu for filtering Task by Person */}
                      <li
                        className={`dropdown-submenu ${
                          submenuTodosByPersonOpen ? "show" : ""
                        }`}
                      >
                        <button
                          className="dropdown-item d-flex justify-content-between align-items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubmenuTodosByPersonOpen((prev) => !prev);
                          }}
                        >
                          <span>
                            <i className="bi bi-calendar-range me-2"></i>
                            Show per Person
                          </span>
                          <i className="bi bi-chevron-right"></i>
                        </button>

                        {submenuTodosByPersonOpen && (
                          <ul
                            className="dropdown-menu p-3 shadow position-absolute top-0 start-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div>
                              <button
                                className="btn-close border position-absolute top-0 end-0 m-1 p-2"
                                onClick={() => {
                                  setSubmenuTodosByPersonOpen(false);
                                }}
                              ></button>
                            </div>
                            <div className="mt-3">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const value = e.target.selectPerson.value;
                                  setGetTodosByPerson(value);
                                  setUpdateTaskList((prev) => !prev);
                                  setSubmenuTodosByPersonOpen(false);
                                }}
                              >
                                <div className="mb-2">
                                  <div className="col-md-6 mb-3">
                                    <label
                                      htmlFor="todoPerson"
                                      className="form-label"
                                    >
                                      Select Person:
                                    </label>
                                    <select
                                      className="form-select"
                                      id="selectPerson"
                                      name="selectPerson"
                                    >
                                      <option value="">
                                        -- Select Person (Optional) --
                                      </option>
                                      <option value="2">Mehrdad Javan</option>
                                      <option value="3">Simon Elbrink</option>
                                    </select>
                                  </div>
                                  <button
                                    type="submit"
                                    className="btn btn-sm btn-primary w-100"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </form>
                            </div>
                          </ul>
                        )}
                      </li>
                      {/* Hover submenu for filtering Task by Status */}
                      <li
                        className={`dropdown-submenu ${
                          submenuTodosByStatusOpen ? "show" : ""
                        }`}
                      >
                        <button
                          className="dropdown-item d-flex justify-content-between align-items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSubmenuTodosByStatusOpen((prev) => !prev);
                          }}
                        >
                          <span>
                            <i className="bi bi-calendar-range me-2"></i>
                            Show by Completed
                          </span>
                          <i className="bi bi-chevron-right"></i>
                        </button>

                        {submenuTodosByStatusOpen && (
                          <ul
                            className="dropdown-menu p-3 shadow position-absolute top-0 start-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div>
                              <button
                                className="btn-close border position-absolute top-0 end-0 m-1 p-2"
                                onClick={() => {
                                  setSubmenuTodosByStatusOpen(false);
                                }}
                              ></button>
                            </div>
                            <div className="mt-3">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  const formData = new FormData(e.target); // e.target here is form
                                  const value = formData.get("completed"); // name on the radio-buttons
                                  console.log("Status: ", value);
                                  setGetTodosByStatus(value === "true");
                                  setUpdateTaskList((prev) => !prev);
                                  setSubmenuTodosByStatusOpen(false);
                                }}
                              >
                                <div className="mb-2">
                                  <div className="col-md-6 mb-3">
                                    <label
                                      htmlFor="todoStatus"
                                      className="form-label"
                                    >
                                      Completed:
                                    </label>
                                    <div id="taskCompleted">
                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="completed"
                                          id="completedTrue"
                                          value="true"
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="completedTrue"
                                        >
                                          Yes
                                        </label>
                                      </div>

                                      <div className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="completed"
                                          id="completedFalse"
                                          value="false"
                                          defaultChecked
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor="completedFalse"
                                        >
                                          No
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    type="submit"
                                    className="btn btn-sm btn-primary w-100"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </form>
                            </div>
                          </ul>
                        )}
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setUpdateTaskList((prev) => !prev);
                          }}
                        >
                          <i className="bi bi-arrow-counterclockwise me-2"></i>
                          Show All Tasks
                        </button>
                      </li>
                    </ul>
                    {/* Sorting buttons*/}
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      title="Sort"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-sort-down"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <span className="mx-2">Sort by:</span>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(taskService.sortTasks(tasks, "titleA-Z"))
                          }
                        >
                          <i className="bi bi-sort-alpha-down me-2"></i>
                          Title (A-Z)
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(taskService.sortTasks(tasks, "titleZ-A"))
                          }
                        >
                          <i className="bi bi-sort-alpha-up me-2"></i>
                          Title (Z-A)
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(
                              taskService.sortTasks(tasks, "dueDateAscending")
                            )
                          }
                        >
                          <i className="bi bi-calendar2-day me-2"></i>
                          Due Date (Lo-Hi)
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(
                              taskService.sortTasks(tasks, "dueDateDescending")
                            )
                          }
                        >
                          <i className="bi bi-calendar2-day me-2"></i>
                          Due Date (Hi-Lo)
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(taskService.sortTasks(tasks, "createdAt"))
                          }
                        >
                          <i className="bi bi-clock me-2"></i>
                          Created At
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(taskService.sortTasks(tasks, "taskDone"))
                          }
                        >
                          <i className="bi bi-check-square-fill me-2"></i>
                          Status Completed
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() =>
                            setTasks(
                              taskService.sortTasks(tasks, "taskNotDone")
                            )
                          }
                        >
                          <i className="bi bi-check-square me-2"></i>
                          Status Not Completed
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => setUpdateTaskList((prev) => !prev)}
                        >
                          <i className="bi bi-arrow-counterclockwise me-2"></i>
                          Reset and Show All
                        </button>
                      </li>
                    </ul>
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

                                {task.assignee?.name ? ( // If task.assignee has a key named "name"
                                  <span className="badge bg-info me-2">
                                    <i className="bi bi-person"></i>{" "}
                                    {task.assignee.name}
                                  </span>
                                ) : task.personId ? ( // If task has NO key named "name" and is NOT unassigned
                                  <button
                                    className="btn btn-sm border-black btn-info mx-1"
                                    style={{
                                      height: "1.8em", // matchar badge höjd
                                      lineHeight: "1.5em", // centrera text vertikalt
                                      padding: "0 0.5em", // matcha badge padding
                                      whiteSpace: "nowrap", // hindrar textbrytning inuti knappen
                                      marginRight: "0.5em", // spacing istället för mx-1
                                      fontSize: "0.75rem", // samma fontstorlek som badges
                                    }}
                                    onClick={async () => {
                                      // Fetch person
                                      const person =
                                        await taskService.getPersonById(
                                          task.personId
                                        );
                                      if (!person) return; // If something goes wrong by fetching with api

                                      // Add to state if it doesn't already exist in state persons
                                      setPersons((prev) => {
                                        if (
                                          !prev.some((p) => p.id === person.id) // i.e.if the opposit of true
                                        ) {
                                          return [...prev, person];
                                        }
                                        return prev; // Otherwise set persons as it was
                                      });

                                      // Update task.assignee locally
                                      {
                                        /*setTasks((prev) =>
                                        prev.map((t) =>
                                          t.id === task.id
                                            ? { ...t, assignee: person }
                                            : t
                                        )
                                      );*/
                                      }
                                      // Update task.assignee globally
                                      setUpdateTaskList((prev) => !prev); // Activate the switch to re-render the component
                                    }}
                                  >
                                    Show Person
                                  </button>
                                ) : (
                                  //If task has NO key named "name" and task.personId is null
                                  <span className="badge bg-warning me-2">
                                    Unassigned
                                  </span>
                                )}

                                <span
                                  className={`badge me-2 ${
                                    task.completed
                                      ? "bg-success"
                                      : task.personId
                                      ? "bg-info text-dark" // In-progress
                                      : "bg-warning text-dark" // Pending
                                  }`}
                                >
                                  {task.completed
                                    ? "Completed"
                                    : task.personId
                                    ? "In-progress"
                                    : "Pending..."}
                                </span>
                                </div>
                                <div>
                                  <span className="badge bg-secondary">
                                    <i className="bi bi-paperclip me-1"></i>{" "}
                                    {task.attachments
                                      ? task.attachments.length
                                      : 0}{" "}
                                    attachment(s)
                                  </span>
                                </div>
                              
                            </div>
                            <div className="btn-group ms-3">
                              <button
                                className="btn btn-outline-success btn-sm"
                                title="Complete"
                                onClick={async () => {
                                  task.completed = !task.completed;
                                  await taskService.updateTodo(task);
                                  setUpdateTaskList((prev) => !prev);
                                }}
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
                                  setUpdateTaskList((prev) => !prev);
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
