

import React, {  useState } from "react";
import { Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import "../styles/ManualAttendance.css";
import toast from "react-hot-toast";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import axios from "axios";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
import { DesktopDatePicker } from "@mui/x-date-pickers";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';



function ManualAttendance(props) {
  
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('timeSlotDefault');
  const [showEnrollmentNo, setShowEnrollmentNo] = useState(false); // New state for showing/hiding Enrollment No.
  const [selectedClass, setSelectedClass] = useState('classDefault');
  const [classList, setClassList] = useState([]);
  const [allPresent, setAllPresent] = useState(false);

  const [timeSlots, setTimeSlots,] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(""); // State to store search term
  

  const [timeSlotDropdownOpen, setTimeSlotDropdownOpen] = useState(false);
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);

  const toggleTimeSlot = () => {
    setClassDropdownOpen(false); // Close the class dropdown
    setTimeSlotDropdownOpen((prevState) => !prevState);
  };
  
  const toggleClass = () => {
    setTimeSlotDropdownOpen(false); // Close the time slot dropdown
    setClassDropdownOpen((prevState) => !prevState);
  };

const to =()=>{}

  React.useMemo(() => {
    console.log(selectedClass);
    if (props.userData.name) {
      axios
        .get(`/faculty/classes/${props.userData.name}`)
        .then((response) => {
          const assignedClasses = response.data;
          // Store the assigned classes in the classList state
          setClassList(assignedClasses);
        })
        .catch((error) => {
          console.error("Error fetching assigned classes:", error);
          // navigate("/login");
          toast.error("Session Expired :/ Please Login Again");
        });
    }

    const attendace = [
      {
        name: "Present",
        accessorKey: "present",
        enableColumnFilter: false,

      }
    ]

    // Fetch student data from the backend when selectedDate or selectedTimeSlot change
    if (selectedDate && (selectedTimeSlot !== 'timeSlotDefault') && (selectedClass !== 'classDefault')) {
      try {
        axios
          .post(`/attendance/manualattendance`, { selectedDate, selectedTimeSlot ,className: selectedClass,})
          .then((response) => {
            // console.log("hi",response.data.studentAttendance);
            // setStudents([]);
            if(response.data.studentAttendance.length <1)
            {
              toast.error("No Students Found, Please Add Students in Selected Class");
              setStudents([]);
            }
            else{
            setStudents(
              response.data.studentAttendance);}

          }).catch((error) => {
            console.error("Error fetching or creatingAttendance data:", error);
            // navigate("/login");
            toast.error("Session Expired :/ Please Login Again");
          });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }
  }, [selectedDate, selectedTimeSlot, props.userData.name,selectedClass]);
  
  

  React.useEffect(() => {
    // Fetch time slots from the server
    axios.get('/timeSlot/time-slots').then((response) => {
      setTimeSlots(response.data.timeSlots);
    }).catch((error) => {
      console.error('Error fetching time slots:', error);
    });

        // Check if all students are present
        const allStudentsPresent = students.length > 0 && students.every(student => student.present);
        setAllPresent(allStudentsPresent);
    
  }, []);

  // Handle the class selection change
  // const handleClassChange = (e) => {
  //   setSelectedClass(e.target.value);
  // };
  const setTodaysDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
  }

  const toggleAllStudents = async () => {
    const updatedStudents = students.map((student) => ({
      ...student,
      present: !allPresent,
    }));
    setStudents(updatedStudents);
    setAllPresent(!allPresent);

    // Update the database for all students
    try {
      await axios.put(`/attendance/updateAll/${selectedDate}/${selectedTimeSlot}`, {
        present: !allPresent,
        className: selectedClass});
    } catch (error) {
      console.error("Error updating all students:", error);
      toast.error("Failed to update all students");
    }
  };


  const toggleAttendance = async (studentEnrollmentNo) => {
    try {
       await axios
        .put(`/attendance/update/${studentEnrollmentNo}`, { selectedDate, selectedTimeSlot })
      .then((response) => {
        
        const updatedTempRecord = response.data.mainRecord;

        // console.log(updatedTempRecord.present);

        const updatedStudents = [...students];
        
        const studentIndex = updatedStudents.findIndex(
          (student) => student.studentId._id === updatedTempRecord.studentId
        );

        if (studentIndex !== -1) {
          updatedStudents[studentIndex].present = updatedTempRecord.present;
          setStudents(updatedStudents);
        } else {
          console.error("Student not found in the students array.");
        }
      })
      .catch((error) => {
        console.error("Error fetching or creatingAttendance data:", error);
        // navigate("/login");
        toast.error("Session Expired :/ Please Login Again");
      });
  } catch (error) {
    console.error("Error toggling attendance:", error);
  }
};


  // Calculate the total, present, and absent students
  const totalStudents = students.length;
  const presentStudents = students.filter((student) => student.present).length;
  const absentStudents = totalStudents - presentStudents;

  // Function to toggle the Enrollment No. column
  const toggleEnrollmentNo = () => {
    setShowEnrollmentNo(!showEnrollmentNo);
  };
  // console.log(classList);




  const columns1 = React.useMemo(
    () => [
      {
        id: 'rollNo',
        accessorKey: 'rollNo',
        header: 'Roll No.',
      },
      {
        accessorKey: 'enrollmentNo',
        header: 'Enrollment No.',
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'present',
        header: 'Present',
      },
    ],
    []
  );

  const dataFinal = students.map((student) => ({
    rollNo: student.studentId.rollNo,
    enrollmentNo: student.studentId.enrollmentNo,
    name: student.studentId.name,
    present: student.present.toString(),
  }));

  const table = useMaterialReactTable({
    columns: columns1,
    data: dataFinal,
    initialState: {
      density: 'compact',
      sorting: [{ id: 'rollNo', desc: false }],
    },
  });



  return (
    <>

      <h1 className="fw-bold fs-10 text-center h1manualattendance">
        Manual Attendance
      </h1>
      <div className="attendance-controls">
        <h3>Select Date, Time-Slot And Class to Fill Attendance</h3>
        <hr />
        
          <Button color="primary" onClick={setTodaysDate}>Fill Today's Attendance</Button>
       <h5>OR</h5>

      
        {/* <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border-dark rounded-2 my-2"
          placeholder="Select Date"
        /> */}
              {/* <DatePicker value={selectedDate} onChange={(date) => setSelectedDate(date)} /> */}
              <div className="date border-dark rounded-2 my-2 w-50 h-0">
              <DesktopDatePicker defaultValue={dayjs('2022-04-17')} value={selectedDate} onChange={(date) => setSelectedDate(date)} label="Select Date"  />

              </div>
<hr />
<hr />
<div className="d-flex justify-content-center align-items-center  p-2">
<Dropdown  isOpen={timeSlotDropdownOpen} toggle={toggleTimeSlot} className="me-3" onMouseLeave={toggleTimeSlot}>
        <DropdownToggle onMouseOver={timeSlotDropdownOpen?to:toggleTimeSlot }    caret  color="light" className="border-dark rounded-2 my-2" data-attr="dropdown-toggle" onClick={toggleTimeSlot}>
          {selectedTimeSlot === 'timeSlotDefault' ? 'Select Time Slot' : selectedTimeSlot}
        </DropdownToggle>
        <DropdownMenu   >
          <DropdownItem header>Select Below &#8609;</DropdownItem>
          {timeSlots.map((timeSlot) => (
            <DropdownItem
              key={timeSlot._id}
              onClick={() => {
                setSelectedTimeSlot(`${timeSlot.startTime} -> ${timeSlot.endTime}`);
              }}
            >
              {`${timeSlot.startTime} -> ${timeSlot.endTime}`}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Dropdown isOpen={classDropdownOpen} onMouseLeave={toggleClass}  toggle={toggleClass}>
        <DropdownToggle onMouseOver={ classDropdownOpen?to:toggleClass}  caret color="light" className="border-dark rounded-2 my-2" onClick={toggleClass}>
          {selectedClass === 'classDefault' ? 'Select Class' : selectedClass}
        </DropdownToggle>
        <DropdownMenu >
          <DropdownItem header>Select Below &#8609;	</DropdownItem>
          {classList.map((assignedClass) => (
            <DropdownItem
            
              key={assignedClass}
              onClick={() => {
                setSelectedClass(assignedClass);
              }}
            >
              {assignedClass}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      </div>
      <hr />
        
        <Button color="success" onClick={toggleAllStudents} className="mx-2"
        disabled={!students.length} // Disable if students are not fetched
                  >
          {allPresent ? "Mark All Absent" : "Mark All Present"}
        </Button>
        
      </div>
      <hr />
      {/* <div className="search-bar-container my-3  mx-auto text-center" >
  <input
    type="text"
    placeholder="Search by Name or enrollment No."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-bar w-75 "
    
    
  />
</div> */}
          <MaterialReactTable table={table} />


{/* <div className="manualAttendance w-100" style={{ overflowX: "auto", overflowY: "auto", maxWidth: "100%", maxHeight: "80vh", margin: "auto" }}>

       <div className="table-responsive">
          <table className="tb">
          <thead>
              <tr className="tr">
                <th className="th" style={{ minWidth: "20vw", maxWidth: "50px", margin: "auto" }} onClick={toggleEnrollmentNo}>
                  Roll No.
                  <br />
                  <button className="btn btn-primary btn-sm " onClick={toggleEnrollmentNo}>
                    {showEnrollmentNo ? "Hide" : "Show"} Enrollment
                  </button>
                </th>
                {showEnrollmentNo && <th className="th" style={{ maxWidth: "100px" }}>Enrollment No.</th>}
                <th className="th" style={{ maxWidth: "150px" }}>Name</th>
                <th className="th" style={{ maxWidth: "120px" }}>Present</th>
              </tr>
            </thead>
        <tbody>
            {students
              .slice()
              .sort((a, b) => parseInt(a.studentId?.enrollmentNo, 10) - parseInt(b.studentId?.enrollmentNo, 10))
              .map((student) => {
      

                return (
                  <tr key={student.studentId?.enrollmentNo}>

                  <td className="td" onClick={toggleEnrollmentNo}>{student.studentId?.rollNo}</td>

                  {showEnrollmentNo && <td className="td">{student.studentId?.enrollmentNo}</td>}
                  
                  <td className="td">{student.studentId?.name}</td>
                 
                  
                  <td className="td" onClick={() =>toggleAttendance(student.studentId.enrollmentNo)}>
                    <Switch
                      onChange={() => ""}
                      checked={student.present}
                    />
                    <p>{student.present ? "Present" : "Absent"}</p>
                  </td>
                </tr>
                );
              })}
          </tbody>
      </table>
      </div>
    </div> */}
      <div className="summary">
        <p>Total Students: {totalStudents}</p>
        <p>Present Students: {presentStudents}</p>
        <p>Absent Students: {absentStudents}</p>
      </div>
    </>
  );
}

export default ManualAttendance;
