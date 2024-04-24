/**
 * Simple script that keeps generating spans by making random rolls via the running sample app.
 */
const INTERVAL_MS = 10000;
const APP_ENDPOINT = 'http://localhost:8080/rolldice';

async function rollDice() {
    let numRolls = Math.floor(Math.random() * 10) + 1;
    console.log(`Making ${numRolls} rolls`);
    let url = APP_ENDPOINT + "?rolls=" + numRolls;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error making roll", response.status);
        } else {
            console.log(response.statusText)
        }
    } catch(error) {
        console.error()
    }
}

const intervalId = setInterval(rollDice, 10 * 1000);
console.log(`Rolling dice every ${INTERVAL_MS} ms with interval ID: ${intervalId}`);
