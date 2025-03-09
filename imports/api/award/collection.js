import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Awards = new Mongo.Collection('Awards');

const AwardsSchema = new SimpleSchema({
  employee_id: { type: String }, // Reference to Employees._id
  award_date: { type: Date },
  reason: { type: String },
  status: { type: String, allowedValues: ['Received', 'Pending'] },
  imageUrl: { type: String, optional: true },
  created_at: { type: Date }
});

Awards.attachSchema?.(AwardsSchema);

