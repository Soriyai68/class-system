import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Employees } from './collection';
import { Departments } from '../department/collection';
import { Division } from '../division/collection';
import { Position } from '../position/collection';

// Insert Employee Method
new ValidatedMethod({
  name: 'insertEmployee',
  validate: new SimpleSchema({
    name: { type: String, max: 100 },
    department_id: { type: String },
    division_id: { type: String, optional: true },
    position_id: { type: String, optional: true },
    position: { type: String, optional: true },
    salary: { type: Number },
    hire_date: { type: Date },
    address: { type: String, optional: true },
    imageUrls: { type: String, optional: true },
    created_at: { type: Date, optional: true },
  }).validator(),
  async run(employeeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add employees.');
    }

    // Validate that the referenced department exists
    const department = await Departments.findOneAsync({ _id: employeeData.department_id });
    if (!department) {
      throw new Meteor.Error('Invalid department', 'The provided department_id does not exist.');
    }

    // If provided, validate that the referenced division exists
    if (employeeData.division_id) {
      const division = await Division.findOneAsync({ _id: employeeData.division_id });
      if (!division) {
        throw new Meteor.Error('Invalid division', 'The provided division_id does not exist.');
      }
    }

    // If provided, validate that the referenced position exists
    if (employeeData.position_id) {
      const position = await Position.findOneAsync({ _id: employeeData.position_id });
      if (!position) {
        throw new Meteor.Error('Invalid position', 'The provided position_id does not exist.');
      }
    }

    try {
      const timestamp = new Date();
      employeeData.created_at = timestamp;
      employeeData.updated_at = timestamp;
      const employeeId = await Employees.insertAsync(employeeData);
      return employeeId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert employee: ${error.message}`);
    }
  },
});

// Fetch Employees Method
new ValidatedMethod({
  name: 'fetchEmployees',
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch employees.');
    }

    try {
      return await Employees.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch employees: ${error.message}`);
    }
  },
});

// Delete Employee Method
new ValidatedMethod({
  name: 'deleteEmployee',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete employees.');
    }

    const employee = await Employees.findOneAsync({ _id });
    if (!employee) {
      throw new Meteor.Error('Invalid employee', 'The provided employee_id does not exist.');
    }

    try {
      await Employees.removeAsync({ _id });
      return { message: 'Employee deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete employee: ${error.message}`);
    }
  },
});

// Update Employee Method
new ValidatedMethod({
  name: 'updateEmployee',
  validate: new SimpleSchema({
    _id: { type: String },
    name: { type: String, optional: true },
    department_id: { type: String, optional: true },
    division_id: { type: String, optional: true },
    position_id: { type: String, optional: true },
    position: { type: String, optional: true },
    salary: { type: Number, optional: true },
    hire_date: { type: Date, optional: true },
    address: { type: String, optional: true },
    imageUrls: { type: String, optional: true },
    created_at: { type: Date, optional: true },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run(employeeData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update employees.');
    }

    if (employeeData.department_id) {
      const department = await Departments.findOneAsync({ _id: employeeData.department_id });
      if (!department) {
        throw new Meteor.Error('Invalid department', 'The provided department_id does not exist.');
      }
    }

    if (employeeData.division_id) {
      const division = await Division.findOneAsync({ _id: employeeData.division_id });
      if (!division) {
        throw new Meteor.Error('Invalid division', 'The provided division_id does not exist.');
      }
    }

    if (employeeData.position_id) {
      const position = await Position.findOneAsync({ _id: employeeData.position_id });
      if (!position) {
        throw new Meteor.Error('Invalid position', 'The provided position does not exist.');
      }
    }

    try {
      const { _id, ...updateData } = employeeData;
      updateData.updated_at = new Date();
      return await Employees.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update employee: ${error.message}`);
    }
  },
});

// Search Employees Method
new ValidatedMethod({
  name: 'searchEmployees',
  validate: new SimpleSchema({
    searchTerm: { type: String },
  }).validator(),
  async run({ searchTerm }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to search employees.');
    }

    try {
      const regex = new RegExp(searchTerm, 'i');
      return Employees.find({
        $or: [
          { name: regex },
          { address: regex },
          { position: regex },
          { imageUrls: regex }
        ]
      }).fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to search employees: ${error.message}`);
    }
  },
});

