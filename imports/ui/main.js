import { Meteor } from 'meteor/meteor';
import { createApp } from 'vue';
//element-plus
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
//vue
import { VueMeteor } from 'vue-meteor-tracker'; // Add VueMeteor for reactivity
import router from './router/index'; // Import the router
import App from './App.vue'; // Import the App component

Meteor.startup(() => {
    // Create the Vue app
    const app = createApp(App);
    // Use VueMeteor for Meteor reactivity
    app.use(VueMeteor);
    // Use the router
    app.use(router);
    // Use ElementPlus
    app.use(ElementPlus);
    // Mount the app
    app.mount('#app');
});