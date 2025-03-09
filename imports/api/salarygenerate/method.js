import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { salaryGenerate } from './collection';
import { salarySetup } from '../salarysetup/collection';

new ValidatedMethod({
  name: 'insertSalaryGenerate',
  mixins: [],
  validate: new SimpleSchema({
    employee_id: { type: String },
    generated_at: { type: Date },
    total_salary: { type: Number, optional: true }, // Optional since we'll calculate it
    created_at: { type: Date, optional: true },
  }).validator(),
  async run(salaryGenerateData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add salary records.');
    }

    try {
      const timestamp = new Date();
      salaryGenerateData.created_at = timestamp;

      // Check if a salary generate record already exists for this employee
      const existingGenerate = await salaryGenerate.findOneAsync({ employee_id: salaryGenerateData.employee_id });
      if (existingGenerate) {
        throw new Meteor.Error('Duplicate Entry', 'A salary generate record already exists for this employee.');
      }

      // Fetch the single salary setup for the employee
      const setup = await salarySetup.findOneAsync({ employee_id: salaryGenerateData.employee_id });
      if (!setup) {
        throw new Meteor.Error('No Salary Setup', 'No salary setup found for this employee.');
      }

      // Set total_salary to the amount from the single salarySetup
      salaryGenerateData.total_salary = setup.amount;

      const salaryGenerateId = await salaryGenerate.insertAsync(salaryGenerateData);
      return salaryGenerateId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert salary record: ${error.message}`);
    }
  },
});

// Fetch SalaryGenerate Method
new ValidatedMethod({
  name: 'fetchSalaryGenerate',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch salary records.');
    }

    try {
      return await salaryGenerate.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch salary records: ${error.message}`);
    }
  },
});

// Update SalaryGenerate Method
new ValidatedMethod({
  name: 'updateSalaryGenerate',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    generated_at: { type: Date, optional: true },
    total_salary: { type: Number, optional: true },
    created_at: { type: Date, optional: true },
  }).validator(),
  async run(salaryGenerateData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update salary records.');
    }

    const { _id, ...updateData } = salaryGenerateData;

    if (!_id) {
      throw new Meteor.Error('Missing ID', 'The _id field is required to update a salary record.');
    }

    try {
      const result = await salaryGenerate.updateAsync({ _id }, { $set: updateData });
      if (result === 0) {
        throw new Meteor.Error('Not Found', 'No salary record found with the provided _id.');
      }
      return { message: 'Salary record updated successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update salary record: ${error.message}`);
    }
  },
});
// Delete SalaryGenerate Method
new ValidatedMethod({
  name: 'deleteSalaryGenerate',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete salary records.');
    }

    const salaryRecord = await salaryGenerate.findOneAsync({ _id });
    if (!salaryRecord) {
      throw new Meteor.Error('Invalid salary record', 'The provided salary record ID does not exist.');
    }

    try {
      await salaryGenerate.removeAsync({ _id });
      return { message: 'Salary record deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete salary record: ${error.message}`);
    }
  },
});

// Fetch SalarySetupsForEmployee Method (unchanged)
new ValidatedMethod({
  name: 'fetchSalarySetupsForEmployee',
  mixins: [],
  validate: new SimpleSchema({
    employee_id: { type: String },
  }).validator(),
  async run({ employee_id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch salary setups.');
    }
    try {
      return await salarySetup.find({ employee_id }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch salary setups: ${error.message}`);
    }
  },
});