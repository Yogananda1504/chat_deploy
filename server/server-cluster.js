const os = require("os");
const cluster = require("cluster");
const numCPUs = os.cpus().length;
const app = require("./temp"); // Import the Express app

if (cluster.isPrimary) {
	console.log(`Primary ${process.pid} is running`);
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	cluster.on("exit", (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
	});
} else {
	app(); // Run the Express app in worker processes
}
