import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Employees } from '../employees/collection';
import { Performance } from './collection';

// Insert Performance
new ValidatedMethod({
  name: 'insertPerformance',
  validate: new SimpleSchema({
    employee_id: { type: String },
    performance_date: { type: Date },
    score: { type: Number },
    feedback: { type: String },
  }).validator(),
  async run(performanceData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add performance records.');
    }

    // Set created_at to current date and time if not provided
    if (!performanceData.created_at) {
      performanceData.created_at = new Date();
    }

    // Validate that the referenced employee exists
    const employee = await Employees.findOneAsync({ _id: performanceData.employee_id });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    try {
      const timestamp = new Date();
      performanceData.created_at = timestamp;
      const performanceId = await Performance.insertAsync(performanceData);
      return performanceId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert performance record: ${error.message}`);
    }
  },
});

// Fetch Performance Records
new ValidatedMethod({
  name: 'fetchPerformanceRecords',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch performance records.');
    }

    try {
      return Performance.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch performance records: ${error.message}`);
    }
  },
});

// Delete Performance Record
new ValidatedMethod({
  name: 'deletePerformanceRecord',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete performance records.');
    }

    const performance = await Performance.findOneAsync({ _id });
    if (!performance) {
      throw new Meteor.Error('Invalid performance record', 'The provided performance_id does not exist.');
    }

    try {
      await Performance.removeAsync({ _id });
      return { message: 'Performance record deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete performance record: ${error.message}`);
    }
  },
});

// Update Performance Record
new ValidatedMethod({
  name: 'updatePerformanceRecord',
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    performance_date: { type: Date, optional: true },
    score: { type: Number, optional: true },
    feedback: { type: String, optional: true },
    created_at: { type: Date, optional: true }, // Will be removed from update
  }).validator(),
  async run(performanceData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update performance records.');
    }

    // Validate that employee exists if employee_id is provided
    if (performanceData.employee_id) {
      const employee = await Employees.findOneAsync({ _id: performanceData.employee_id });
      if (!employee) {
        throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
      }
    }

    try {
      // Remove created_at from update data
      const { _id, created_at, ...updateData } = performanceData;
      return await Performance.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update performance record: ${error.message}`);
    }
  },
});

// Search Performance Records
new ValidatedMethod({
  name: 'searchPerformanceRecords',
  validate: new SimpleSchema({
    searchTerm: { type: String },
  }).validator(),
  async run({ searchTerm }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search performance records.');
    }

    try {
      const regex = new RegExp(searchTerm, 'i');
      return Performance.find({
        $or: [
          { employee_id: regex },
          { performance_date: regex },
          { score: regex },
          { feedback: regex },
        ]
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search performance records: ${error.message}`);
    }
  },
});

