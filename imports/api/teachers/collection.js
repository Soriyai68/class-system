import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Teachers = new Mongo.Collection('teachers');

const TeachersSchema = new SimpleSchema({
    first_name: {
        type: String,
        label: "First Name",
    },
    last_name: {
        type: String,
        label: "Last Name",
    },
    email: {
        type: String,
        // regEx: emailRegex,
        label: "Email",
    },
    phone: {
        type: String,
        label: "Phone Number",
    },
    subject: {
        type: String,
        label: "Subject",
    },
    // courses_taught: {
    //     type: Array,
    //     label: "Courses Taught",
    //     optional: true,
    // },
    // 'courses_taught.$': {
    //     type: String,  
    // },
});

Teachers.attachSchema?.(TeachersSchema);

