import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';


export const Students = new Mongo.Collection('students');

const StudentsSchema = new SimpleSchema({
  first_name: {
    type: String,
    label: "First Name",
    max: 50,
  },
  last_name: {
    type: String,
    label: "Last Name",
    max: 50,
  },
  date_of_birth: {
    type: Date,
    label: "Date of Birth",
  },
  email: {
    type: String,
    label: "Email",
  },
  phone: {
    type: String,
    label: "Phone Number",
    max: 15,
  },
  // enrolled_courses: {
  //   type: Array,
  //   label: "Enrolled Courses",
  //   optional: true,
  // },
  // 'enrolled_courses.$': {
  //   type: String, // Assuming course IDs are stored as strings
  // },
  address: {
    type: String,
    label: "Address",
    optional: true, // Optional field
  },
});

Students.attachSchema?.(StudentsSchema);
