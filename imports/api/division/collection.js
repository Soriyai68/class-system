import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Division = new Mongo.Collection('divisions');

const DivisionSchema = new SimpleSchema({
  name: { type: String },
  description: { type: String },
  position_id: { type: String, optional: true },
  department_id: { type: String, optional: true },
  created_at: { type: Date },
  updated_at: { type: Date }
});

Division.attachSchema?.(DivisionSchema);

