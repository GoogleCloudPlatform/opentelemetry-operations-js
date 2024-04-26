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

// Simple script that keeps generating spans by making random rolls via the running sample app.
import axios, {AxiosResponse} from 'axios';

const INTERVAL_MS = 10000;
const APP_ENDPOINT = 'http://localhost:8080/rolldice';

async function rollDice() {
  const numRolls = Math.floor(Math.random() * 10) + 1;
  console.log(`Making ${numRolls} rolls`);
  const url = APP_ENDPOINT + '?rolls=' + numRolls;
  try {
    const response: AxiosResponse = await axios(url);
    if (response.status !== 200) {
      console.error('Error making roll', response.status);
    } else {
      console.log(response.statusText);
    }
  } catch (error) {
    console.error();
  }
}

const intervalId = setInterval(rollDice, 10 * 1000);
console.log(
  `Rolling dice every ${INTERVAL_MS} ms with interval ID: ${intervalId}`
);
