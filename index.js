require("replace-in-file").sync({
  files: "src/**/*.md",
  from: /..\/assets\//g,
  to: "https://raw.githubusercontent.com/Jiavan/blog/master/src/assets/"
});
