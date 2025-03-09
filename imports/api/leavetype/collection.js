import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const LeaveType = new Mongo.Collection('LeaveType');

const LeaveTypeSchema = new SimpleSchema({
  type_name: { type: String },
  created_at: { type: Date, autoValue() { if (this.isInsert) return new Date(); } },
  updated_at: { type: Date, optional: true, autoValue() { if (this.isUpdate) return new Date(); } }
});

LeaveType.attachSchema?.(LeaveTypeSchema);

