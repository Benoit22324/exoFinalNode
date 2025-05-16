import path from "node:path";

const dirname = import.meta.dirname;
export const dataPath = path.join(dirname, "..", "data", "students.json");

const viewPath = path.join(dirname, "..", "view");
export const homePath = path.join(viewPath, "home.pug");
export const studentPath = path.join(viewPath, "student.pug");

const assetsPath = path.join(dirname, "..", "..", "assets");
export const stylePath = path.join(assetsPath, "css");