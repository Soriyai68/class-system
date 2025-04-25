import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Attendance = new Mongo.Collection('Attendances');

const AttendancesSchema = new SimpleSchema({
  employee_id: { type: String }, // Reference to Employees._id
  attendance_date: { type: Date },
  status: { type: String },
  in_time: { type: Date },
  out_time: { type: Date },
  reason: { type: String },
  session: { type: String, allowedValues: ['Morning', 'Afternoon'] }
});

Attendance.attachSchema?.(AttendancesSchema);

