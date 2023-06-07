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
      setTasks(tasks);
    } catch (error) {}
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

    const sourceColumnId = result.source.droppableId;
    const destinationColumnId = result.destination.droppableId;
    const draggedTaskId = result.draggableId; // Use the provided draggableId directly

    // Create a copy of the tasks array
    const updatedTasks = [...tasks];

    // Find the dragged task in the tasks array
    const draggedTask = updatedTasks.find((task) => task._id === draggedTaskId);

    // Update the status of the dragged task
    draggedTask.status = destinationColumnId;

    // Reorder the tasks within the destination column
    const sourceTasks = updatedTasks.filter(
      (task) => task.status === sourceColumnId
    );
    const destinationTasks = updatedTasks.filter(
      (task) => task.status === destinationColumnId
    );
    const sourceIndex = sourceTasks.findIndex(
      (task) => task._id === draggedTaskId
    );
    const destinationIndex = result.destination.index;

    // Remove the dragged task from the source column
    sourceTasks.splice(sourceIndex, 1);

    // Insert the dragged task at the correct position in the destination column
    destinationTasks.splice(destinationIndex, 0, draggedTask);

    // Update the state with the updated tasks
    setTasks(updatedTasks);

    // Make API call to update the task status
    callAPI(`/feedback/${draggedTaskId}`, "PUT", {
      status: destinationColumnId,
    })
      .then((res) => {
        console.log("Task status updated successfully");
      })
      .catch((err) => {
        console.log(err);
      });
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
  const filteredTasks = tasks.filter((task) => {
    const taskIndex = tasks.findIndex((t) => t._id === task._id);
    return tasks[taskIndex].status === droppableId;
  });

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
