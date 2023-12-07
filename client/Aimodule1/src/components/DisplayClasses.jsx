import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

function DisplayClasses() {
  const [classOptions, setClassOptions] = useState([]);
  const [updateClassData, setUpdateClassData] = useState({
    id: '',
    name: '',
  });
  const [isUpdateFormVisible, setUpdateFormVisible] = useState(false);

  useEffect(() => {
    fetchClassOptions();
  }, []);

  const fetchClassOptions = () => {
    axios.get('/class').then((response) => {
      setClassOptions(response.data);
    });
  };
  const handleRefresh = () => {
    axios.get('/class').then((response) => {
      setClassOptions(response.data);
    });
  };
  const openUpdateForm = (classId, className) => {
    setUpdateClassData((prevData) => ({ ...prevData, id: classId, name: className }));
    setUpdateFormVisible(true);
  };

  const closeUpdateForm = () => {
    setUpdateFormVisible(false);
  };

  const handleUpdateClass = () => {
    // Send a PUT request to update the class with the new data.
    const { id, name } = updateClassData;
    axios.put(`/class/${id}`, { name })
      .then((response) => {
        // Handle the success case.
        console.log(`Class with ID ${id} updated successfully.`);
        toast.success('Updated Successfully');
        // Close the update form and refresh the class list after the update.
        closeUpdateForm();
        fetchClassOptions();
      })
      .catch((error) => {
        // Handle any errors.
        toast.error('Failed to Update');

        console.error(`Error updating class with ID ${id}: ${error}`);
      });
  };

  const handleDeleteClass = (classId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this class?');
    if (confirmDelete) {
      // Send a DELETE request to delete the class.
      axios.delete(`/class/${classId}`)
        .then((response) => {
          // Handle the success case.
          console.log(`Class with ID ${classId} deleted successfully.`);
          // Refresh the class list after deletion.
          fetchClassOptions();
          // handleRefresh();
        })
        .catch((error) => {
          // Handle any errors.
          console.error(`Error deleting class with ID ${classId}: ${error}`);
        });
    }
  };

  return (
    <div>
      <h2>Modify Classes</h2> <button onClick={handleRefresh}>Refresh</button>
      <ul>
        {classOptions.map((option) => (
          <li key={option._id}>
            {option.name}
            <button onClick={() => openUpdateForm(option._id, option.name)}>Update</button>
            <button onClick={() => handleDeleteClass(option._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {isUpdateFormVisible && (
        <div>
          <h3>Update Class</h3>
          <input
            type="text"
            value={updateClassData.name}
            onChange={(e) => setUpdateClassData((prevData) => ({ ...prevData, name: e.target.value }))}
          />
          <button onClick={handleUpdateClass}>Save</button>
          <button onClick={closeUpdateForm}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default DisplayClasses;
