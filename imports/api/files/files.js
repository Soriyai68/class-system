import { FilesCollection } from "meteor/ostrio:files";
import { getFilePath } from "./path";

const Files = new FilesCollection({
  debug: false,
  storagePath: () => {
    return getFilePath();
  },
  collectionName: "app_files",
});

export default Files;
