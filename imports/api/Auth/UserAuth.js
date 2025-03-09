// import { Meteor } from "meteor/meteor";
// import { check } from "meteor/check";

// Meteor.methods({
//   "users.getAll"() {
//     return Meteor.users.find({}, { fields: { emails: 1, createdAt: 1 } }).fetch();
//   },

//   "users.update"(userId, updateData) {
//     check(userId, String);
//     check(updateData, Object);
//     Meteor.users.update(userId, { $set: updateData });
//   },

//   "users.delete"(userId) {
//     check(userId, String);
//     Meteor.users.remove(userId);
//   },
// });
