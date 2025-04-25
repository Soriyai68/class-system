import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { LeaveApplication } from './collection';
import { LeaveType } from '../leavetype/collection';
import { Employees } from '../employees/collection';

// Insert Leave Application Method
new ValidatedMethod({
  name: 'insertLeaveApplication',
  mixins: [],
  validate: new SimpleSchema({
    employee_id: { type: String }, // Reference to Employee._id
    leave_type_id: { type: String }, // Reference to LeaveType._id
    start_date: { type: Date },
    end_date: { type: Date },
    status: { type: String },
  }).validator(),
  async run(leaveApplicationData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add leave applications.');
    }

    // Set created_at to current date and time if not provided
    if (!leaveApplicationData.created_at) {
      leaveApplicationData.created_at = new Date();
    }

    const employee = await Employees.findOneAsync({ _id: leaveApplicationData.employee_id });

    if (!employee) {
      throw new Meteor.Error('Employee not found', 'The selected employee does not exist.');
    }

    const leaveType = await LeaveType.findOneAsync({ _id: leaveApplicationData.leave_type_id });

    if (!leaveType) {
      throw new Meteor.Error('Leave type not found', 'The selected leave type does not exist.');
    }

    try {
      const timestamp = new Date();
      leaveApplicationData.created_at = timestamp;
      leaveApplicationData.updated_at = timestamp;
      const leaveApplicationId = await LeaveApplication.insertAsync(leaveApplicationData);
      return leaveApplicationId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert leave application: ${error.message}`);
    }
  },
});

// Fetch Leave Applications Method
new ValidatedMethod({
  name: 'fetchLeaveApplications',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch leave applications.');
    }

    try {
      const leaveApplications = await LeaveApplication.find().fetch();
      return await Promise.all(leaveApplications.map(async application => {
        const employee = await Employees.findOneAsync({ _id: application.employee_id });
        const leaveType = await LeaveType.findOneAsync({ _id: application.leave_type_id });
        return {
          ...application,
          employee_name: employee ? employee.name : 'Unknown',
          leave_type_name: leaveType ? leaveType.type_name : 'Unknown',
        };
      }));
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch leave applications: ${error.message}`);
    }
  },
});

// Update Leave Application Method
new ValidatedMethod({
  name: 'updateLeaveApplication',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    leave_type_id: { type: String, optional: true },
    start_date: { type: Date, optional: true },
    end_date: { type: Date, optional: true },
    status: { type: String, optional: true },
  }).validator(),
  async run(leaveApplicationData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update leave applications.');
    }

    const employee = await Employees.findOneAsync({ _id: leaveApplicationData.employee_id });

    if (!employee) {
      throw new Meteor.Error('Employee not found', 'The selected employee does not exist.');
    }

    const leaveType = await LeaveType.findOneAsync({ _id: leaveApplicationData.leave_type_id });

    if (!leaveType) {
      throw new Meteor.Error('Leave type not found', 'The selected leave type does not exist.');
    }

    try {
      const { _id, ...updateData } = leaveApplicationData;
      updateData.updated_at = new Date();
      return await LeaveApplication.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update leave application: ${error.message}`);
    }
  },
});

// Delete Leave Application Method
new ValidatedMethod({
  name: 'deleteLeaveApplication',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    const leaveApplication = await LeaveApplication.findOneAsync({ _id });
    if (!leaveApplication) {
      throw new Meteor.Error('not-found', 'Leave application not found');
    }

    try {
      await LeaveApplication.removeAsync({ _id });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete leave application: ${error.message}`);
    }
  },
});
