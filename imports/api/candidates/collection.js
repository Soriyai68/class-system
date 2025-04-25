import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Candidates = new Mongo.Collection('Candidates');

const CandidatesSchema = new SimpleSchema({
  position_id: { type: String }, // Reference to Positions._id
  name: { type: String },
  phone: { type: String, optional: true },
  email: { type: String, regEx: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, // Fixed email validation
  status: { type: String },
  created_at: { type: Date }
});

Candidates.attachSchema?.(CandidatesSchema);

