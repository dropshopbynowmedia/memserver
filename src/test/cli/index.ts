import test from "ava";
import fs from "fs-extra";
import util from "util";
import child_process from "child_process";

const CWD = process.cwd();
const shell = util.promisify(child_process.exec);

test.afterEach.always(async () => {
  if (await fs.pathExists(`${CWD}/memserver`)) {
    await fs.remove(`${CWD}/memserver`);
  }
});

test.serial(
  "$ memserver | and $ memserver helper | and $ memserver h | without arguments shows help screen",
  async (t) => {
    t.plan(3);

    const jsonDataBuffer = await fs.readFile(`${CWD}/package.json`);
    const version = JSON.parse(jsonDataBuffer.toString()).version;
    const expectedOutput = `[MemServer CLI v${version}] Usage: memserver <command (Default: help)>

memserver init | new                    # Sets up the initial memserver folder structure
memserver generate model [ModelName]    # Generates the initial files for a MemServer Model [alias: "memserver g model"]
memserver generate fixtures             # Outputs your initial MemServer state as pure javascript fixture files
memserver generate fixtures [ModelName] # Outputs your initial MemServer state for certain model as pure javascript fixture
memserver console                       # Starts a MemServer console in node.js [alias: "memserver c"]
`;

    let result = await shell(`node ${CWD}/dist/cli.js`);

    t.true(result.stdout.includes(expectedOutput));

    result = await shell(`node ${CWD}/dist/cli.js help`);

    t.true(result.stdout.includes(expectedOutput));

    result = await shell(`node ${CWD}/dist/cli.js h`);

    t.true(result.stdout.includes(expectedOutput));
  }
);

test.serial("$ memserver init | sets up the initial folder structure", async (t) => {
  t.plan(6);

  t.true(!fs.pathExistsSync(`${CWD}/memserver`));

  const expectedOutput =
    "[MemServer CLI] /memserver/server.js created\n" +
    "[MemServer CLI] /memserver/initializer.js created\n" +
    "[MemServer CLI] /memserver/fixtures folder created\n" +
    "[MemServer CLI] /memserver/models folder created\n";

  const { stdout } = await shell(`node ${CWD}/dist/cli.js init`);

  t.is(stdout, expectedOutput);

  const [
    serverBuffer,
    initializerBuffer,
    fixturesFolderExistence,
    modelsFolderExists
  ] = await Promise.all([
    fs.readFile(`${CWD}/memserver/server.js`),
    fs.readFile(`${CWD}/memserver/initializer.js`),
    fs.pathExists(`${CWD}/memserver/fixtures`),
    fs.pathExists(`${CWD}/memserver/models`)
  ]);

  t.is(serverBuffer.toString(), "export default function(Models) {\n}");
  t.is(initializerBuffer.toString(), "export default function(Models) {\n}");
  t.true(fixturesFolderExistence);
  t.true(modelsFolderExists);
});

test.serial("$ memserver new | sets up the initial folder structure", async (t) => {
  t.plan(6);

  t.true(!fs.pathExistsSync(`${CWD}/memserver`));

  const expectedOutput =
    "[MemServer CLI] /memserver/server.js created\n" +
    "[MemServer CLI] /memserver/initializer.js created\n" +
    "[MemServer CLI] /memserver/fixtures folder created\n" +
    "[MemServer CLI] /memserver/models folder created\n";

  const { stdout } = await shell(`node ${CWD}/dist/cli.js new`);

  t.is(stdout, expectedOutput);

  const [
    serverBuffer,
    initializerBuffer,
    fixturesFolderExistence,
    modelsFolderExists
  ] = await Promise.all([
    fs.readFile(`${CWD}/memserver/server.js`),
    fs.readFile(`${CWD}/memserver/initializer.js`),
    fs.pathExists(`${CWD}/memserver/fixtures`),
    fs.pathExists(`${CWD}/memserver/models`)
  ]);

  t.is(serverBuffer.toString(), "export default function(Models) {\n}");
  t.is(initializerBuffer.toString(), "export default function(Models) {\n}");
  t.true(fixturesFolderExistence);
  t.true(modelsFolderExists);
});

test.serial("$ memserver version | and $ memserver v", async (t) => {
  t.plan(2);

  let result = await shell(`node ${CWD}/dist/cli.js v`);

  t.is(result.stdout, `[MemServer CLI] ${require(`${CWD}/package.json`).version}\n`);

  result = await shell(`node ${CWD}/dist/cli.js version`);

  t.is(result.stdout, `[MemServer CLI] ${require(`${CWD}/package.json`).version}\n`);
});
