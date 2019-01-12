import * as shell from "shelljs";

const copy = (f: string) => shell.cp("-R", "./" + f, "./dist/" + f);

copy("src/ui");
copy("src/DOCUMENTATION.md");
copy("src/config/swagger.yaml");
