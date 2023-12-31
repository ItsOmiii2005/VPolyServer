const Class = require('../models/Class');
const StudentAttendance = require('../models/studentAttendance');



const attendanceControllers = {

  getAttendanceByStudentEnroll:
    async (req, res) => {
      const studentEnrollmentNo = req.params.studentEnrollmentNo;

      const { startDate, endDate, selectedMonth, selectedTimeSlot } = req.query;
      // console.log( startDate, endDate, selectedMonth,selectedTimeSlot);

      try {
        const year = new Date().getFullYear();
        let startDateTime, endDateTime;

        if (selectedMonth !== undefined) {
          const month = Number(selectedMonth);
          startDateTime = new Date(year, month, 2);
          endDateTime = new Date(year, month + 1, 1);
        } else {
          startDateTime = startDate ? new Date(startDate) : new Date(0);
          endDateTime = endDate ? new Date(endDate) : new Date();
        }

        const attendanceData = await StudentAttendance.find({
          studentEnrollmentNo,
          date: { $gte: startDate ? startDate : startDateTime, $lte: endDate ? endDate : endDateTime },
          timeSlot: selectedTimeSlot
        });

        res.json(attendanceData);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  ,
  getAllAttendance: async (req, res) => {
    const enrollArray = req.query.enrollArray;
    const selectedMonth = req.query.selectedMonth;
    const selectedTimeSlot = req.query.selectedTimeSlot;
    const { startDate, endDate } = req.query;
    console.log(selectedMonth ? "yes" : "", selectedTimeSlot ? "yes" : "");

    try {
      const year = new Date().getFullYear();
      let startDateTime, endDateTime;

      if (selectedMonth !== undefined) {
        const month = Number(selectedMonth);
        startDateTime = new Date(year, month, 2);
        endDateTime = new Date(year, month + 1, 1);
      } else {
        startDateTime = startDate ? new Date(startDate) : new Date(0);
        endDateTime = endDate ? new Date(endDate) : new Date();
      }

      const attendanceData = await StudentAttendance.find({
        studentEnrollmentNo: { $in: enrollArray },
        date: { $gte: startDate ? startDate : startDateTime, $lte: endDate ? endDate : endDateTime },
        timeSlot: selectedTimeSlot
      });
      console.log(attendanceData);
      res.json(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  getAllStudentForMalualAttendace: async (req, res) => {
    const { selectedDate, selectedTimeSlot, className } = req.body;
    console.log(selectedDate, selectedTimeSlot, className);
    try {
      // Find the class by name and populate its students
      const classData = await Class.findOne({ name: className }).populate('students');

      if (!classData) {
        return res.status(404).json({ message: `Class '${className}' not found.` });
      }

      console.log(`Class: ${classData.name}`);
      console.log('Students:');

      // Clear the studentsToAdd array before processing students for the new class
      const studentsToAdd = [];

      for (const student of classData.students) {
        const existingAttendance = await StudentAttendance.findOne({
          studentId: student._id,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
        });

        if (!existingAttendance) {
          // If the student is not present, add them to the attendance model
          studentsToAdd.push({
            studentId: student._id,
            studentName: student.name,
            studentRollNo: student.rollNo,
            studentEnrollmentNo: student.enrollmentNo,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            present: false,
          });
        }

        console.log(`- ${student.name}`);
      }

      // Insert new student attendance records if there are any
      if (studentsToAdd.length > 0) {
        await StudentAttendance.insertMany(studentsToAdd);
        // console.log('Added new attendance records for missing students.');
      }

      // Now, send all the student attendance data as a response, including both existing and newly added records
      const allStudentAttendance = await StudentAttendance.find({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
      }).populate({
        path: 'studentId',
        populate: {
          path: 'class', // Populate the class field in studentId
        },
      });
      const filteredStudentAttendance = allStudentAttendance.filter((attendance) => {
        return attendance.studentId?.class?.name === className;
      });
      console.log(filteredStudentAttendance);

      res.json({ data: true, studentAttendance: filteredStudentAttendance });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  ,
  getAllStudentForMalualAttendaceToday: async (req, res) => {
    const { selectedTimeSlot, className } = req.body;
    const today = new Date(); // Get today's date
    // const dayOfWeek = today.getDay();
    const date = today.getDate();
    const month = today.getMonth();
    const year = today.getFullYear();
    const selectedDate = `${year}-${month + 1}-${date}`
    // console.log(selectedDate);
    try {
      // Find the class by name and populate its students
      const classData = await Class.findOne({ name: className }).populate('students');

      if (!classData) {
        return res.status(404).json({ message: `Class '${className}' not found.` });
      }

      // console.log(`Class: ${classData.name}`);
      // console.log('Students:');

      // Clear the studentsToAdd array before processing students for the new class
      const studentsToAdd = [];

      for (const student of classData.students) {
        const existingAttendance = await StudentAttendance.findOne({
          studentId: student._id,
          date: selectedDate,
          timeSlot: selectedTimeSlot,
        });

        if (!existingAttendance) {
          // If the student is not present, add them to the attendance model
          studentsToAdd.push({
            studentId: student._id,
            studentName: student.name,
            studentRollNo: student.rollNo,
            studentEnrollmentNo: student.enrollmentNo,
            date: selectedDate,
            timeSlot: selectedTimeSlot,
            present: false,
          });
        }

        console.log(`- ${student.name}`);
      }

      // Insert new student attendance records if there are any
      if (studentsToAdd.length > 0) {
        await StudentAttendance.insertMany(studentsToAdd);
        console.log('Added new attendance records for missing students.');
      }

      // Now, send all the student attendance data as a response, including both existing and newly added records
      const allStudentAttendance = await StudentAttendance.find({
        date: selectedDate,
        timeSlot: selectedTimeSlot,
      }).populate({
        path: 'studentId',
        populate: {
          path: 'class', // Populate the class field in studentId
        },
      });
      const filteredStudentAttendance = allStudentAttendance.filter((attendance) => {
        return attendance.studentId.class.name === className;
      });
      // console.log(filteredStudentAttendance);

      res.json({ data: true, studentAttendance: filteredStudentAttendance });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  updateAttendance: async (req, res) => {

    const studentEnrollmentNo = req.params.id;
    const { selectedDate, selectedTimeSlot } = req.body;
    // console.log(studentEnrollmentNo, selectedDate, selectedTimeSlot);
    try {

      // Also update the corresponding record in the main database
      const mainRecord = await StudentAttendance.findOne({
        studentEnrollmentNo: studentEnrollmentNo,
        date: `${selectedDate}`,
        timeSlot: selectedTimeSlot,

      });
      // console.log(mainRecord);
      if (!mainRecord) {
        // If the record doesn't exist in the main database, return an error
        return res.status(404).json({ error: 'Record not found' });
      }
      // console.log("Mainrecbefor" + mainRecord);

      mainRecord.present = !mainRecord.present;
      await mainRecord.save();
      console.log("Mainrecafter" + mainRecord);

      res.json({ data: true, mainRecord });
      // res.json({ data: true, userData });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  updateAllAttendance: async (req, res) => {
    const { date, timeSlot } = req.params;
    const { present, studentList } = req.body;

    console.log(date, timeSlot, present, studentList);
  
    try {
      // Find all students for the given date, time slot, and class
      const students = await StudentAttendance.find({
        date,
        timeSlot,
        studentEnrollmentNo: { $in: studentList },
      });
      console.log(students);
  
      // Update the present status for all students
      await Promise.all(
        students.map(async (student) => {
          // Update the present status directly
          student.present = present;
          await student.save();
        })
      );
  
      res.json({ message: 'Attendance updated successfully' });
    } catch (error) {
      console.error('Error updating all students:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

}

module.exports = attendanceControllers;