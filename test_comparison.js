
const listTime = "2025-03-12 15:26:59";
const dbTime = "2025-03-12T15:26:59";  // ISO from DB
const dbTime2 = "2025-03-12 15:26:59"; // Maybe from DB if cast differently

console.log(`"${listTime}" > "${dbTime}" is ${listTime > dbTime}`);
console.log(`"${listTime}" > "${dbTime2}" is ${listTime > dbTime2}`);

const d1 = new Date(listTime);
const d2 = new Date(dbTime);

console.log(`Date("${listTime}") > Date("${dbTime}") is ${d1 > d2}`);
console.log(`Date("${listTime}")getTime() === Date("${dbTime}").getTime() is ${d1.getTime() === d2.getTime()}`);
