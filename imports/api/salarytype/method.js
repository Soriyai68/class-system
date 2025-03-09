import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { SalaryType } from './collection';

// Insert SalaryType Method
new ValidatedMethod({
  name: 'insertSalaryType',
  mixins: [],
  validate: new SimpleSchema({
    name: { type: String, max: 100 },
    description: { type: String, optional: true },
    created_at: { type: Date, optional: true },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run(salaryTypeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add salary types.');
    }

    try {
      const timestamp = new Date();
      salaryTypeData.created_at = timestamp;
      salaryTypeData.updated_at = timestamp;
      const salaryTypeId = await SalaryType.insertAsync(salaryTypeData);
      return salaryTypeId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert salary type: ${error.message}`);
    }
  },
});

// Fetch SalaryTypes Method
new ValidatedMethod({
  name: 'fetchSalaryTypes',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch salary types.');
    }

    try {
      return await SalaryType.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch salary types: ${error.message}`);
    }
  },
});

// Delete SalaryType Method
new ValidatedMethod({
  name: 'deleteSalaryType',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete salary types.');
    }

    const salaryType = await SalaryType.findOneAsync({ _id });
    if (!salaryType) {
      throw new Meteor.Error('Invalid salary type', 'The provided salary type ID does not exist.');
    }

    try {
      await SalaryType.removeAsync({ _id });
      return { message: 'Salary type deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete salary type: ${error.message}`);
    }
  },
});

// Update SalaryType Method
new ValidatedMethod({
  name: 'updateSalaryType',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    name: { type: String, optional: true },
    description: { type: String, optional: true },
    created_at: { type: Date, optional: true },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run(salaryTypeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update salary types.');
    }

    try {
      const { _id, ...updateData } = salaryTypeData;
      updateData.updated_at = new Date();
      return await SalaryType.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update salary type: ${error.message}`);
    }
  },
});

