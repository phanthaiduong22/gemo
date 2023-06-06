import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import CustomNavbar from "../../components/CustomNavbar/CustomNavbar";
import TaskItem from "../../components/TaskItem/TaskItem";
import callAPI from "../../utils/apiCaller";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);

  const fetchData = async () => {
    try {
      const response = await callAPI("/feedback", "GET", null);
      const tasks = response.data.feedbacks;
      console.log("tasks", tasks);
      setTasks(tasks);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskUpdate = (taskId, updatedTask) => {
    const updatedTasks = tasks.map((task) => {
      if (task._id === taskId) {
        return updatedTask;
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    // const sourceColumnId = result.source.droppableId;
    const destinationColumnId = result.destination.droppableId;
    const draggedTaskIndex = result.source.index;

    const updatedTasks = [...tasks]; // Copy the tasks array
    const draggedTask = updatedTasks[draggedTaskIndex];
    draggedTask.status = destinationColumnId;

    // Make API call to update the task status
    callAPI(`/feedback/${draggedTask._id}`, "PUT", {
      status: destinationColumnId,
    })
      .then((res) => {
        console.log("Task status updated successfully");
      })
      .catch((err) => {
        console.log(err);
      });

    updatedTasks.splice(draggedTaskIndex, 1);
    updatedTasks.splice(result.destination.index, 0, draggedTask);
    setTasks(updatedTasks);
  };

  return (
    <div>
      <CustomNavbar className="mb-2" />
      <div className="container border rounded mt-2">
        <h2 className="text-2xl align-items-center font-bold mb-4 mt-4">
          Tasks
        </h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="row">
            <Column
              title="Pending"
              droppableId="Pending"
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
            />
            <Column
              title="In Progress"
              droppableId="In Progress"
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
            />
            <Column
              title="Completed"
              droppableId="Completed"
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
            />
            <Column
              title="Deleted"
              droppableId="Deleted"
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
            />
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

const Column = ({ title, droppableId, tasks, onTaskUpdate }) => {
  const filteredTasks = tasks
    ? tasks.filter((task) => task.status === droppableId)
    : [];

  const handleTaskUpdate = (taskId, updatedTask) => {
    onTaskUpdate(taskId, updatedTask);
  };

  return (
    <div className="col border rounded p-2">
      <h2 className="text-center">{title}</h2>
      <hr />
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <ul
            className="list-group"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {filteredTasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(provided) => (
                  <li
                    className="list-group-item"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskItem task={task} onTaskUpdate={handleTaskUpdate} />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </div>
  );
};

export default TaskPage;
