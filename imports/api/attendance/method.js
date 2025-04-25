import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Employees } from '../employees/collection';
import { Attendance } from './collection';

// Insert Attendance
new ValidatedMethod({
  name: 'insertAttendance',
  validate: new SimpleSchema({
    employee_id: { type: String },
    attendance_date: { type: Date },
    status: { type: String },
    in_time: { type: Date },
    out_time: { type: Date, optional: true },
    reason: { type: String, optional: true },
    session: { type: String, allowedValues: ['Morning', 'Afternoon'] }
  }).validator(),
  async run(attendanceData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add attendance.');
    }

    // Set created_at to current date and time if not provided
    if (!attendanceData.created_at) {
      attendanceData.created_at = new Date();
    }

    // Validate that the referenced employee exists
    const employee = await Employees.findOneAsync({ _id: attendanceData.employee_id });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    try {
      const timestamp = new Date();
      attendanceData.created_at = timestamp;
      const attendanceId = await Attendance.insertAsync(attendanceData);
      return attendanceId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert attendance: ${error.message}`);
    }
  },
});

// Fetch Attendance
new ValidatedMethod({
  name: 'fetchAttendance',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch attendance.');
    }

    try {
      return Attendance.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch attendance: ${error.message}`);
    }
  },
});

// Delete Attendance
new ValidatedMethod({
  name: 'deleteAttendance',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete attendance.');
    }

    const attendance = await Attendance.findOneAsync({ _id });
    if (!attendance) {
      throw new Meteor.Error('Invalid attendance', 'The provided attendance_id does not exist.');
    }

    try {
      await Attendance.removeAsync({ _id });
      return { message: 'Attendance deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete attendance: ${error.message}`);
    }
  },
});

// Update Attendance
new ValidatedMethod({
  name: 'updateAttendance',
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    attendance_date: { type: Date, optional: true },
    status: { type: String, optional: true },
    in_time: { type: Date, optional: true },
    out_time: { type: Date, optional: true },
    reason: { type: String },
    created_at: { type: Date, optional: true }, // Will be removed from update
    session: { type: String, optional: true, allowedValues: ['Morning', 'Afternoon'] }
  }).validator(),
  async run(attendanceData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update attendance.');
    }

    // Validate that employee exists if employee_id is provided
    if (attendanceData.employee_id) {
      const employee = await Employees.findOneAsync({ _id: attendanceData.employee_id });
      if (!employee) {
        throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
      }
    }

    try {
      // Remove created_at from update data
      const { _id, created_at, ...updateData } = attendanceData;
      return await Attendance.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update attendance: ${error.message}`);
    }
  },
});

// Search Attendance
new ValidatedMethod({
  name: 'searchAttendance',
  validate: new SimpleSchema({
    searchTerm: { type: String },
  }).validator(),
  async run({ searchTerm }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const regex = new RegExp(searchTerm, 'i');
      return Attendance.find({
        $or: [
          { employee_id: regex },
          { attendance_date: regex },
          { status: regex },
        ]
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance by Day
new ValidatedMethod({
  name: 'searchAttendanceByDay',
  validate: new SimpleSchema({
    date: { type: Date },
    session: { type: String, allowedValues: ['', 'Morning', 'Afternoon'], optional: true }
  }).validator(),
  async run({ date, session }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const query = {
      attendance_date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    if (session) {
      query.session = session;
    }

    try {
      return Attendance.find(query).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance by Week
new ValidatedMethod({
  name: 'searchAttendanceByWeek',
  validate: new SimpleSchema({
    date: { type: Date },
    session: { type: String, allowedValues: ['', 'Morning', 'Afternoon'], optional: true }
  }).validator(),
  async run({ date, session }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const query = {
        attendance_date: {
          $gte: startOfWeek,
          $lte: endOfWeek
        }
      };

      if (session) {
        query.session = session;
      }

      return Attendance.find(query).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance by Month
new ValidatedMethod({
  name: 'searchAttendanceByMonth',
  validate: new SimpleSchema({
    date: { type: Date },
    session: { type: String, allowedValues: ['', 'Morning', 'Afternoon'], optional: true }
  }).validator(),
  async run({ date, session }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const query = {
        attendance_date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      };

      if (session) {
        query.session = session;
      }

      return Attendance.find(query).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance for Today
new ValidatedMethod({
  name: 'searchAttendanceToday',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      return Attendance.find({
        attendance_date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance for Yesterday
new ValidatedMethod({
  name: 'searchAttendanceYesterday',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
      const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

      return Attendance.find({
        attendance_date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance for Last Week
new ValidatedMethod({
  name: 'searchAttendanceLastWeek',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() - 7));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return Attendance.find({
        attendance_date: {
          $gte: startOfWeek,
          $lte: endOfWeek
        }
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance for Last Month
new ValidatedMethod({
  name: 'searchAttendanceLastMonth',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfMonth.setHours(23, 59, 59, 999);

      return Attendance.find({
        attendance_date: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});

// Search Attendance by Session
new ValidatedMethod({
  name: 'searchAttendanceBySession',
  validate: new SimpleSchema({
    session: { type: String, allowedValues: ['', 'Morning', 'Afternoon'] },
    date: { type: Date }
  }).validator(),
  async run({ session, date }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search attendance.');
    }

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const query = {
      attendance_date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    if (session) {
      query.session = session;
    }

    try {
      return Attendance.find(query).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search attendance: ${error.message}`);
    }
  },
});



<<<<<<< HEAD


=======
>>>>>>> 92e68984dfd6ec38312b9f190580ddcf80fba0cd
