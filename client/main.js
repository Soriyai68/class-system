import '/imports/ui/main.js';
import { Meteor } from "meteor/meteor";

// Fetch all users
Meteor.call('users.getAll', (error, result) => {
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    console.log("Users fetched successfully:", result);
  }
});

