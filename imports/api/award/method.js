import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Employees } from '../employees/collection';
import { Awards } from './collection';

// Insert Award
new ValidatedMethod({
  name: 'insertAward',
  validate: new SimpleSchema({
    employee_id: { type: String },
    award_date: { type: Date },
    reason: { type: String },
    status: { type: String, allowedValues: ['Received', 'Pending'] },
    imageUrl: { type: String, optional: true },
  }).validator(),
  async run(awardData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add awards.');
    }

    // Set created_at to current date and time if not provided
    if (!awardData.created_at) {
      awardData.created_at = new Date();
    }

    // Validate that the referenced employee exists
    const employee = await Employees.findOneAsync({ _id: awardData.employee_id });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    try {
      const timestamp = new Date();
      awardData.created_at = timestamp;
      const awardId = await Awards.insertAsync(awardData);
      return awardId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert award: ${error.message}`);
    }
  },
});

// Fetch Awards
new ValidatedMethod({
  name: 'fetchAwards',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch awards.');
    }

    try {
      return Awards.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch awards: ${error.message}`);
    }
  },
});

// Delete Award
new ValidatedMethod({
  name: 'deleteAward',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete awards.');
    }

    const award = await Awards.findOneAsync({ _id });
    if (!award) {
      throw new Meteor.Error('Invalid award', 'The provided award_id does not exist.');
    }

    try {
      await Awards.removeAsync({ _id });
      return { message: 'Award deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete award: ${error.message}`);
    }
  },
});

// Update Award
new ValidatedMethod({
  name: 'updateAward',
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    award_date: { type: Date, optional: true },
    reason: { type: String, optional: true },
    status: { type: String, allowedValues: ['Received', 'Pending'], optional: true },
    imageUrl: { type: String, optional: true },
    created_at: { type: Date, optional: true }, // Will be removed from update
  }).validator(),
  async run(awardData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update awards.');
    }

    // Validate that employee exists if employee_id is provided
    if (awardData.employee_id) {
      const employee = await Employees.findOneAsync({ _id: awardData.employee_id });
      if (!employee) {
        throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
      }
    }

    try {
      // Remove created_at from update data
      const { _id, created_at, ...updateData } = awardData;
      return await Awards.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update award: ${error.message}`);
    }
  },
});

// Search Awards
new ValidatedMethod({
  name: 'searchAwards',
  validate: new SimpleSchema({
    searchTerm: { type: String },
  }).validator(),
  async run({ searchTerm }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search awards.');
    }

    try {
      const regex = new RegExp(searchTerm, 'i');
      return Awards.find({
        $or: [
          { employee_id: regex },
          { award_date: regex },
          { reason: regex },
          { status: regex },
          { imageUrl: regex },
        ]
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search awards: ${error.message}`);
    }
  },
});
