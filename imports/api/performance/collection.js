import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Performance = new Mongo.Collection('Performance');

const PerformanceSchema = new SimpleSchema({
  employee_id: { type: String }, // Reference to Employees._id
  performance: { type: String },
  description: { type: String },
  created_at: { type: Date }
});

Performance.attachSchema?.(PerformanceSchema);

