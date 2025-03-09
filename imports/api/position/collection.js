import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Position = new Mongo.Collection('positions');

const PositionSchema = new SimpleSchema({
  title: { type: String },
  description: { type: String, optional: true },
  division_id: { type: String },
  created_at: { type: Date },
  updated_at: { type: Date }
});

Position.attachSchema?.(PositionSchema);

