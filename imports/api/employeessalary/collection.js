import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const salaryEmployees = new Mongo.Collection('salaryEmployees');

const salaryEmployeesSchema = new SimpleSchema({
  employee_id: { type: String }, // Reference to Employees._id
  base_salary: { type: Number },// total salary
  adjuctments: { type: Number , optional: true },
  effective_date: { type: Date },
  total_salary : {type: Number},
  description: { type: String, optional: true },
  created_at: { type: Date },
  updated_at: { type: Date },
});

salaryEmployees.attachSchema?.(salaryEmployeesSchema);

