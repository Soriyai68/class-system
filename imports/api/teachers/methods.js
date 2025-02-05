import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Teachers } from './collection';

// Insert Teacher Method
new ValidatedMethod({
  name: 'insertTeachers',
  mixins: [],
  validate: new SimpleSchema({
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: { type: String },
    subject: { type: String },
    // Removed courses_taught from the schema
  }).validator(),
  async run(teacherData) {
    if (!this.userId) {
      throw new Meteor.Error(
        'Not authorized',
        'You must be logged in to add teachers.'
      );
    }

    try {
      return await Teachers.insertAsync(teacherData);
    } catch (error) {
      throw new Meteor.Error(
        'Database Error',
        `Failed to insert teacher: ${error.message}`
      );
    }
  },
});

// Fetch All Teachers Method
new ValidatedMethod({
  name: 'fetchTeachers',
  mixins: [],
  validate: null,
  async run() {
    if (!this.userId) {
      throw new Meteor.Error(
        'Not authorized',
        'You must be logged in to fetch teachers.'
      );
    }

    try {
      return await Teachers.find().fetch();
    } catch (error) {
      throw new Meteor.Error(
        'Database Error',
        `Failed to fetch teachers: ${error.message}`
      );
    }
  },
});

// Delete Teacher Method
new ValidatedMethod({
  name: 'deleteTeachers',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error(
        'Not authorized',
        'You must be logged in to delete teachers.'
      );
    }

    try {
      await Teachers.removeAsync({ _id });
      return { message: 'គ្រូបានលុបដោយជោគជ័យ!' };
    } catch (error) {
      throw new Meteor.Error(
        'Database Error',
        `Failed to delete teacher: ${error.message}`
      );
    }
  },
});

// Update Teacher Method
new ValidatedMethod({
  name: 'updateTeachers',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    phone: { type: String },
    subject: { type: String },
    // Removed courses_taught from the schema
  }).validator(),
  async run(teacherData) {
    if (!this.userId) {
      throw new Meteor.Error(
        'Not authorized',
        'You must be logged in to update teachers.'
      );
    }
    try {
      const { _id, ...updateData } = teacherData;
      return await Teachers.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error(
        'Database Error',
        `Failed to update teacher: ${error.message}`
      );
    }
  },
});
