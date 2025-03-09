import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const LeaveApplication = new Mongo.Collection('LeaveApplication');

const LeaveApplicationSchema = new SimpleSchema({
  employee_id: { type: String },     // Reference to Employees._id
  leave_type_id: { type: String },   // Reference to LeaveTypes._id
  start_date: { type: Date },
  end_date: { type: Date },
  status: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date },
});

LeaveApplication.attachSchema?.(LeaveApplicationSchema);

