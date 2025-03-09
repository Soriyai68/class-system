import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const salaryGenerate = new Mongo.Collection('salaryGenerate');

const salarySetupSchema = new SimpleSchema({
  employee_id: { type: String },
  generated_at: { type: Date },
  created_at: { type: Date, optional: true },
  total_salary: { type: Number },
});

salaryGenerate.attachSchema?.(salarySetupSchema);

