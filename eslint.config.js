// Copyright 2020 Google LLC
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

module.exports = {
    plugins: [
      "@typescript-eslint",
    ],
    extends: [
        "./node_modules/gts",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "project": "./tsconfig.json"
    },
    rules: {
      "@typescript-eslint/no-this-alias": "off",
      "eqeqeq": "off",
      "prefer-rest-params": "off",
      "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "memberLike",
            "modifiers": ["private", "protected"],
            "format": ["camelCase"],
            "leadingUnderscore": "require"
          }
      ],
      "@typescript-eslint/no-inferrable-types": ["error", { ignoreProperties: true }],
      "arrow-parens": ["error", "as-needed"],
      "prettier/prettier": ["error", { "singleQuote": true, "arrowParens": "avoid" }],
      "node/no-deprecated-api": ["warn"]
    },
    overrides: [
      {
        "files": ["test/**/*.ts"],
        "rules": {
          "no-empty": "off",
          "@typescript-eslint/ban-ts-ignore": "off",
          "@typescript-eslint/no-empty-function": "off", 
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "@typescript-eslint/no-var-requires": "off"
        }
      }
    ]
  };
  