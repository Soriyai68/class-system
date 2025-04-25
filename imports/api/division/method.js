import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Division } from './collection';
import { Departments } from '../department/collection';
import { Position } from '../position/collection';

// Insert Division Method
new ValidatedMethod({
  name: 'insertDivision',
  mixins: [],
  validate: new SimpleSchema({
    department_id: { type: String },
    name: { type: String, max: 100 },
    description: { type: String, optional: true },
    created_at: { type: Date, optional: true },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run(divisionData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add divisions.');
    }

    const department = await Departments.findOneAsync({ _id: divisionData.department_id });
    if (!department) {
      throw new Meteor.Error('Invalid department', 'The provided department_id does not exist.');
    }

    try {
      const timestamp = new Date();
      divisionData.created_at = timestamp;
      divisionData.updated_at = timestamp;
      const divisionId = await Division.insertAsync(divisionData);
      return divisionId;
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to insert division: ${error.message}`);
    }
  },
});

// Fetch Divisions Method
new ValidatedMethod({
  name: 'fetchDivisions',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch divisions.');
    }

    try {
      const divisions = await Division.find().fetch();
      const departments = await Departments.find().fetch();
      return divisions.map(division => {
        const department = departments.find(dep => dep._id === division.department_id);
        return {
          ...division,
          department: department ? { name: department.name } : null
        };
      });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to fetch divisions: ${error.message}`);
    }
  },
});

// Delete Division Method
new ValidatedMethod({
  name: 'deleteDivision',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete divisions.');
    }

    const division = await Division.findOneAsync({ _id });
    if (!division) {
      throw new Meteor.Error('Invalid division', 'The provided division_id does not exist.');
    }

    try {
      await Division.removeAsync({ _id });
      return { message: 'Division deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete division: ${error.message}`);
    }
  },
});

// Update Division Method
new ValidatedMethod({
  name: 'updateDivision',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    department_id: { type: String, optional: true },
    name: { type: String, optional: true },
    description: { type: String, optional: true },
    created_at: { type: Date, optional: true },
    updated_at: { type: Date, optional: true },
  }).validator(),
  async run(divisionData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update divisions.');
    }

    if (divisionData.department_id) {
      const department = await Departments.findOneAsync({ _id: divisionData.department_id });
      if (!department) {
        throw new Meteor.Error('Invalid department', 'The provided department_id does not exist.');
      }
    }

    try {
      const { _id, ...updateData } = divisionData;
      updateData.updated_at = new Date();
      return await Division.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update division: ${error.message}`);
    }
  },
});
