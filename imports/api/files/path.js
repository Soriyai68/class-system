import { Meteor } from "meteor/meteor";
import path from "path";

export const getFilePath = () => {
  return Meteor.isProduction
    ? `uploads-rabbit`
    : path.join(
        `${process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]}`,
        `uploads-hr`
      );
};
