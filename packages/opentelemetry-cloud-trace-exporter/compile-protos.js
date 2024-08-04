// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {promisify} = require('util');
const {join} = require('path');
const protofiles = require('google-proto-files');
const pbjs = require('protobufjs-cli/pbjs');

const pbjsMain = promisify(pbjs.main);

/**
 * Generates a JSON representation of the protocol buffer definitions.
 *
 * This function uses the protobufjs CLI tool to convert .proto files into a JSON format.
 * The paths to the proto files are resolved using the google-proto-files module.
 *
 * The generated JSON file is saved to the 'protos' directory.
 *
 * If an error occurs during the generation process, it will be caught and logged to the console.
 */
async function generateProtoJSON() {
  const protoPath = protofiles.getProtoPath('..');
  const tracingProtoPath = protofiles.getProtoPath(
    'devtools',
    'cloudtrace',
    'v2',
    'tracing.proto'
  );
  const outputFilePath = join('protos', 'protos.json');

  const pbjsArgs = [
    '--target',
    'json',
    '-p',
    protoPath,
    '-o',
    outputFilePath,
    tracingProtoPath,
  ];

  try {
    await pbjsMain(pbjsArgs);
    console.log('Proto JSON file generated successfully.');
  } catch (error) {
    console.error('Error generating Proto JSON file:', error);
  }
}

generateProtoJSON();
