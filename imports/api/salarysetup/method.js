import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { salarySetup } from './collection';

// Insert SalarySetup Method
new ValidatedMethod({
  name: 'insertSalarySetup',
  validate: new SimpleSchema({
    employee_id: { type: String },
    salary_type_id: { type: String },
    amount: { type: Number },
  }).validator(),
  async run({ employee_id, salary_type_id, amount }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    try {
      // Check if a salary setup already exists for this employee
      const existingSetup = await salarySetup.findOneAsync({ employee_id });
      if (existingSetup) {
        throw new Meteor.Error('Duplicate Entry', 'A salary setup already exists for this employee.');
      }

      const timestamp = new Date();
      const salarySetupId = await salarySetup.insertAsync({
        employee_id,
        salary_type_id,
        amount,
        created_at: timestamp,
      });
      return salarySetupId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert salary setup: ${error.message}`);
    }
  },
});

// Update SalarySetup Method
new ValidatedMethod({
  name: 'updateSalarySetup',
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String },
    salary_type_id: { type: String },
    amount: { type: Number },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run({ _id, employee_id, salary_type_id, amount }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    try {
      const timestamp = new Date();
      await salarySetup.updateAsync({ _id }, {
        $set: {
          employee_id,
          salary_type_id,
          amount,
          updated_at: timestamp,
        },
      });
      return { message: 'Salary setup updated successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update salary setup: ${error.message}`);
    }
  },
});

// Delete SalarySetup Method
new ValidatedMethod({
  name: 'deleteSalarySetup',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    try {
      await salarySetup.removeAsync({ _id });
      return { message: 'Salary setup deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete salary setup: ${error.message}`);
    }
  },
});

// Fetch SalarySetups Method
new ValidatedMethod({
  name: 'fetchSalarySetups',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized');
    }

    try {
      return await salarySetup.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch salary setups: ${error.message}`);
    }
  },
});