import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { LeaveType } from './collection';

// Insert LeaveType Method
new ValidatedMethod({
  name: 'insertLeaveType',
  mixins: [],
  validate: new SimpleSchema({
    type_name: { type: String, max: 100 },
  }).validator(),
  async run(leaveTypeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add leave types.');
    }

    try {
      return await LeaveType.insertAsync({ ...leaveTypeData, created_at: new Date() });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert leave type: ${error.message}`);
    }
  },
});

// Fetch LeaveTypes Method
new ValidatedMethod({
  name: 'fetchLeaveTypes',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch leave types.');
    }

    try {
      return await LeaveType.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch leave types: ${error.message}`);
    }
  },
});

// Delete LeaveType Method
new ValidatedMethod({
  name: 'deleteLeaveType',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    const leaveType = await LeaveType.findOneAsync(_id);
    if (!leaveType) {
      throw new Meteor.Error('not-found', 'Leave type not found');
    }

    try {
      await LeaveType.removeAsync(_id);
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete leave type: ${error.message}`);
    }
  },
});

// Update LeaveType Method
new ValidatedMethod({
  name: 'updateLeaveType',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    type_name: { type: String, optional: true },
  }).validator(),
  async run(leaveTypeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update leave types.');
    }

    try {
      const { _id, created_at, updated_at, ...updateData } = leaveTypeData;
      updateData.updated_at = new Date();
      return await LeaveType.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update leave type: ${error.message}`);
    }
  },
});

