import test from 'ava';
import fs from 'fs-extra';

const CWD = process.cwd();

test.afterEach.always(async () => {
  if (await fs.exists(`${CWD}/memserver`)) {
    await fs.remove(`${CWD}/memserver`);
  }
});

test.serial('MemServer require() should throw error if /memserver folder doesnt exist', (t) => {
  const error = t.throws(() => require('../lib/index.js'), Error);

  t.true(/\/memserver folder doesn't exist for this directory!/.test(error.message));
});

test.serial('MemServer require() should throw error if /memserver/models folder doesnt exist', async (t) => {
  await fs.mkdir(`${CWD}/memserver`);

  const error = t.throws(() => require('../lib/index.js'), Error);

  t.true(/\/memserver\/models folder doesn't exist for this directory!/.test(error.message));
});

test.serial('MemServer require() should throw error if /memserver/server.js doesnt exist', async (t) => {
  await fs.mkdir(`${CWD}/memserver`);
  await fs.mkdir(`${CWD}/memserver/models`);

  const error = t.throws(() => require('../lib/index.js'), Error);

  t.true(/\/memserver\/server.js doesn't exist for this directory!/.test(error.message));
});

test.serial('MemServer require() exports a MemServer with right functions and empty DB when there is no model', async (t) => {
  t.plan(4);

  await fs.mkdir(`${CWD}/memserver`);
  await fs.mkdir(`${CWD}/memserver/models`);
  await fs.writeFile(`${CWD}/memserver/server.js`, 'export default function(Models) {}');

  const MemServer = require('../lib/index.js');

  t.deepEqual(MemServer.DB, {});
  t.deepEqual(MemServer.Server, {});
  t.deepEqual(Object.keys(MemServer), ['DB', 'Server', 'Models', 'start', 'shutdown']);
  t.deepEqual(MemServer.Models, {});
});

test.serial('MemServer require() exports a MemServer with right functions and empty DB and models', async (t) => {
  t.plan(10);

  const modelFileContent = `import Model from '${CWD}/lib/model';

  export default Model({});`;

  await fs.mkdir(`${CWD}/memserver`);
  await fs.mkdir(`${CWD}/memserver/models`);
  await Promise.all([
    fs.writeFile(`${CWD}/memserver/models/photo.js`, modelFileContent),
    fs.writeFile(`${CWD}/memserver/models/user.js`, modelFileContent),
    fs.writeFile(`${CWD}/memserver/models/photo-comment.js`, modelFileContent),
    fs.writeFile(`${CWD}/memserver/server.js`, 'export default function(Models) {}')
  ]);

  Object.keys(require.cache).forEach((key) => delete require.cache[key]);

  const MemServer = require('../lib/index.js');
  const models = Object.keys(MemServer.Models);

  t.deepEqual(MemServer.DB, {});
  t.deepEqual(MemServer.Server, {});
  t.deepEqual(Object.keys(MemServer), ['DB', 'Server', 'Models', 'start', 'shutdown']);
  t.deepEqual(models, ['PhotoComment', 'Photo', 'User']);

  models.forEach((modelName) => {
    const model = MemServer.Models[modelName];

    t.is(model.modelName, modelName);
    t.deepEqual(Object.keys(MemServer.Models[modelName]), [
      'modelName', 'primaryKey', 'defaultAttributes', 'attributes', 'count', 'find', 'findBy',
      'findAll', 'insert', 'update', 'delete', 'embed', 'embedReferences', 'serializer',
      'serialize', 'getRelationship'
    ]);
  });
});
