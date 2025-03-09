import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Departments = new Mongo.Collection('department');

const DepartmentsSchema = new SimpleSchema({
  name: { type: String },
  description: { type: String},
  created_at: { type: Date },
  updated_at: { type: Date }
});

Departments.attachSchema?.(DepartmentsSchema);

