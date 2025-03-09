import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Employees = new Mongo.Collection('employees');

const EmployeesSchema = new SimpleSchema({
  department_id: { type: String },
  division_id: { type: String, optional: true },
  position_id: { type: String, optional: true },
  imageUrls: { type: String, optional: true }, // Add this line
  name: { type: String, max: 100 },
  address: { type: String, optional: true },
  phone: { type: String, optional: true },
  email: { type: String, optional: true },
  hire_date: { type: Date },
  salary: { type: Number },
  created_at: { type: Date },
  updated_at: { type: Date },

});

Employees.attachSchema?.(EmployeesSchema);
