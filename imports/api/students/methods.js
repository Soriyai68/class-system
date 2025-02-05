import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import { Students } from './collection'; // Ensure this import is correct

// Insert Student Method
new ValidatedMethod({
  name: 'insertStudents',
  mixins: [],
  validate: new SimpleSchema({
    first_name: { type: String, max: 50 },
    last_name: { type: String, max: 50 },
    email: { type: String }, // Email validation
    phone: { type: String, max: 15 },
    date_of_birth: { type: Date },
    address: { type: String, optional: true },
  }).validator(),
  async run(studentData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to add students.');
    }

    console.log('Inserting student data:', studentData);  // Log student data to check the content

    try {
      // Use insertAsync() instead of insert()
      const studentId = await Students.insertAsync(studentData);
      console.log('Inserted student ID:', studentId);  // Log the inserted student ID
      return studentId; // Return the student ID on successful insertion
    } catch (error) {
      console.error('Failed to insert student:', error);  // Log the actual error
      throw new Meteor.Error('Database Error', `Failed to insert student: ${error.message}`);
    }
  },
});

// Fetch Students Method
new ValidatedMethod({
  name: 'fetchStudents',
  mixins: [],
  validate: null, // No validation needed for fetching students
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to fetch students.');
    }

    try {
      console.log('Fetching all students');  // Log when fetch operation starts
      const studentsList = await Students.find().fetch();
      console.log('Fetched students:', studentsList);  // Log the fetched students list
      return studentsList; // Return the list of students
    } catch (error) {
      console.error('Failed to fetch students:', error);  // Log any fetch errors
      throw new Meteor.Error('Database Error', `Failed to fetch students: ${error.message}`);
    }
  },
});

// Delete Student Method
new ValidatedMethod({
  name: 'deleteStudent',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to delete students.');
    }

    try {
      await Students.removeAsync({ _id });
      return { message: 'Student deleted successfully!' };
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to delete student: ${error.message}`);
    }
  },
});

// Update Student Method
new ValidatedMethod({
  name: 'updateStudent',
  mixins: [],
  validate: new SimpleSchema({
    _id: { type: String },
    first_name: { type: String, optional: true },
    last_name: { type: String, optional: true },
    email: { type: String, optional: true },
    phone: { type: String, optional: true },
    date_of_birth: { type: Date, optional: true },
    address: { type: String, optional: true },
  }).validator(),
  async run(studentData) {
    if (!this.userId) {
      throw new Meteor.Error('Not authorized', 'You must be logged in to update students.');
    }

    try {
      const { _id, ...updateData } = studentData;
      return await Students.updateAsync({ _id }, { $set: updateData });
    } catch (error) {
      throw new Meteor.Error('Database Error', `Failed to update student: ${error.message}`);
    }
  },
});
