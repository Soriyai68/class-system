// server/salaryEmployees.js
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Employees } from '../employees/collection';
import { salaryEmployees } from './collection';
import { salaryGenerate } from '../salarygenerate/collection';

// Insert SalaryEmployee Method
new ValidatedMethod({
  name: 'insertSalaryEmployee',
  validate: new SimpleSchema({
    employee_id: { type: String },
    adjustments: { type: Number, optional: true },
    description: { type: String, optional: true }, // Added description
    effective_date: { type: Date },
  }).validator(),
  async run({ employee_id, adjustments, description, effective_date }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add salary records.');
    }

    const employee = await Employees.findOneAsync({ _id: employee_id });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    const salaryGenRecord = await salaryGenerate
      .findOneAsync(
        { employee_id },
        { sort: { generated_at: -1 } }
      );
    if (!salaryGenRecord) {
      throw new Meteor.Error('No salary generated', 'No salary generation record found for this employee.');
    }

    try {
      const timestamp = new Date();
      const baseSalary = salaryGenRecord.total_salary;
      const calculatedTotalSalary = baseSalary + (adjustments || 0);

      const salaryEmployeeId = await salaryEmployees.insertAsync({
        employee_id,
        base_salary: baseSalary,
        adjustments: adjustments || 0,
        description, // Include description
        total_salary: calculatedTotalSalary,
        effective_date,
        created_at: timestamp,
        updated_at: timestamp,
      });
      return salaryEmployeeId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert salary employee: ${error.message}`);
    }
  },
});

// Fetch SalaryEmployees Method
new ValidatedMethod({
  name: 'fetchSalaryEmployees',
  validate: new SimpleSchema({
    fields: {
      type: Object,
      optional: true,
      blackbox: true,
    },
  }).validator(),
  async run({ fields } = {}) {
    console.log('fetchSalaryEmployees method called with fields:', fields);
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch salary records.');
    }

    if (!salaryEmployees) {
      throw new Meteor.Error('Collection Error', 'salaryEmployees is not defined in this context.');
    }

    try {
      const defaultFields = {
        employee_id: 1,
        base_salary: 1,
        adjustments: 1,
        description: 1, // Added description
        total_salary: 1,
        effective_date: 1,
        created_at: 1,
        updated_at: 1,
      };

      const projection = fields ? { ...defaultFields, ...fields } : defaultFields;
      const result = await salaryEmployees.find({}, { fields: projection }).fetch();
      console.log('Fetched salary employees:', result);
      return result;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch salary employees: ${error.message}`);
    }
  },
});

// Update SalaryEmployee Method
new ValidatedMethod({
  name: 'updateSalaryEmployee',
  validate: new SimpleSchema({
    _id: { type: String },
    employee_id: { type: String, optional: true },
    adjustments: { type: Number, optional: true },
    description: { type: String, optional: true }, // Added description
    effective_date: { type: Date, optional: true },
  }).validator(),
  async run({ _id, employee_id, adjustments, description, effective_date }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update salary records.');
    }

    const existingRecord = await salaryEmployees.findOneAsync({ _id });
    if (!existingRecord) {
      throw new Meteor.Error('Invalid record', 'The provided salary record does not exist.');
    }

    const targetEmployeeId = employee_id || existingRecord.employee_id;
    const employee = await Employees.findOneAsync({ _id: targetEmployeeId });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    try {
      const timestamp = new Date();
      const updateData = {};

      // Only update employee_id and base_salary if employee_id changes
      if (employee_id) {
        const salaryGenRecord = await salaryGenerate.findOneAsync(
          { employee_id: targetEmployeeId },
          { sort: { generated_at: -1 } }
        );
        if (!salaryGenRecord) {
          throw new Meteor.Error('No salary generated', 'No salary generation record found for this employee.');
        }
        updateData.employee_id = employee_id;
        updateData.base_salary = salaryGenRecord.total_salary;
        updateData.total_salary = salaryGenRecord.total_salary + (adjustments !== undefined ? adjustments : existingRecord.adjustments || 0);
      }

      // Update adjustments and total_salary if provided, without touching base_salary
      if (adjustments !== undefined && !employee_id) {
        updateData.adjustments = adjustments;
        updateData.total_salary = existingRecord.base_salary + adjustments;
      }

      // Include description if provided
      if (description !== undefined) {
        updateData.description = description;
      }

      if (effective_date) {
        updateData.effective_date = effective_date;
      }
      updateData.updated_at = timestamp;

      console.log('Update data being sent:', updateData);

      await salaryEmployees.updateAsync({ _id }, { $set: updateData });
      return { message: 'Salary employee updated successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update salary employee: ${error.message}`);
    }
  },
});

// Delete SalaryEmployee Method
new ValidatedMethod({
  name: 'deleteSalaryEmployee',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete salary records.');
    }

    const salaryRecord = await salaryEmployees.findOneAsync({ _id });
    if (!salaryRecord) {
      throw new Meteor.Error('Invalid record', 'The provided salary record does not exist.');
    }

    try {
      await salaryEmployees.removeAsync({ _id });
      return { message: 'Salary employee deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete salary employee: ${error.message}`);
    }
  },
});

// Fetch Base Salary Method
new ValidatedMethod({
  name: 'fetchBaseSalary',
  validate: new SimpleSchema({
    employee_id: { type: String },
  }).validator(),
  async run({ employee_id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch base salary.');
    }

    const salaryGenRecord = await salaryGenerate
      .findOneAsync(
        { employee_id },
        { sort: { generated_at: -1 } }
      );
    if (!salaryGenRecord) {
      throw new Meteor.Error('No salary generated', 'No salary generation record found for this employee.');
    }

    return salaryGenRecord.total_salary;
  },
});