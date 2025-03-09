import { Meteor } from "meteor/meteor";
import Files from "./files";

Meteor.methods({
  findImageData: async () => {
    if (Meteor.isServer) {
      try {
        let images = await Files.collection.find({}, { sort: { date: -1 } }).fetch();
        images.forEach((o) => {
          o.url = Files.link(o);
        });
        return images.map(image => ({
          ...image,
          url: Files.link(image)
        }));
      } catch (error) {
        console.error('Error fetching image data:', error);
      }
    }
  },

  findImage: ({ _id }) => {
    if (Meteor.isServer) {
      let image = Files.findOne({ _id });
      if (image) {
        return {
          ...image,
          url: Files.link(image)
        };
      }
      return null;
    }
  },

  updateFile: ({ _id, file }) => {
    if (Meteor.isServer) {
      try {
        Files.collection.update(_id, {
          $set: { file },
        });
      } catch (error) {
        throw new Meteor.Error('file-update-failed', error.message);
      }
    }
  },
});


