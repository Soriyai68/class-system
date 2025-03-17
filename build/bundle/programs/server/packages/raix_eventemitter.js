Package["core-runtime"].queue("raix:eventemitter",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;

/* Package-scope variables */
var EventEmitter;

(function(){

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/raix_eventemitter/eventemitter.server.js                 //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
/* global EventEmitter: true */
EventEmitter = Npm.require('events').EventEmitter;

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
return {
  export: function () { return {
      EventEmitter: EventEmitter
    };}
}});
