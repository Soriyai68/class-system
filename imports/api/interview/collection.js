import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Interviews = new Mongo.Collection('Interviews');

const InterviewsSchema = new SimpleSchema({
  candidate_id: { type: String }, // Reference to Candidates._id
  interview_date: { type: Date },
  status: { type: String },
  notes: { type: String, optional: true },
  result: { type: String, allowedValues: ['pass', 'fail', 'interviewing'] },
  created_at: { type: Date }
});

Interviews.attachSchema?.(InterviewsSchema);

