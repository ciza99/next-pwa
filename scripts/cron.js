const INTERVAL = 10 * 1000;

setInterval(() => {
  console.log("Sending cron request...");
  fetch("http://localhost:3000/api/cron", {
    signal: AbortSignal.timeout(5000),
  });
}, INTERVAL);
