import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Departments } from './collection';
import { Division } from '../division/collection';

// Insert Department Method
new ValidatedMethod({
  name: 'insertDepartment',
  mixins: [],
  validate: new SimpleSchema({
    name: { type: String, max: 100 },
    description: { type: String, optional: true },
  }).validator(),
  async run(departmentData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add departments.');
    }

    try {
      return await Departments.insertAsync(departmentData);
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert department: ${error.message}`);
    }
  },
});

// Fetch Departments Method
new ValidatedMethod({
  name: 'fetchDepartments',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch departments.');
    }

    try {
      return await Departments.find().fetch();
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch departments: ${error.message}`);
    }
  },
});

// Delete Department Method
new ValidatedMethod({
  name: 'deleteDepartment',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete departments.');
    }

    const relatedDivisions = await Division.find({ department_id: _id }).countAsync();
    if (relatedDivisions > 0) {
      throw new Meteor.Error('Cannot delete', 'There are divisions associated with this department.');
    }

    try {
      await Departments.removeAsync({ _id });
      return { message: 'Department deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete department: ${error.message}`);
    }
  },
});

// Update Department Method
new ValidatedMethod({
  name: 'updateDepartment',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    name: { type: String, optional: true },
    description: { type: String, optional: true },
  }).validator(),
  async run(departmentData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update departments.');
    }

    try {
      const { _id, ...updateData } = departmentData;
      return await Departments.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update department: ${error.message}`);
    }
  },
});
