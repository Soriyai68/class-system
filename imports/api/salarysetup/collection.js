import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const salarySetup = new Mongo.Collection('salarySetup');

const salarySetupSchema = new SimpleSchema({
  employee_id: { type: String },
  salary_type_id: { type: String },
  amount: { type: Number },
  created_at: { type: Date, optional: true },
  updated_at: { type: Date, optional: true },
});

salarySetup.attachSchema?.(salarySetupSchema);

