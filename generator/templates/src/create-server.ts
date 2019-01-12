import http = require("http");
import httpShutdown = require("http-shutdown");

import { Socket } from "net";

export const createServer = (app) => {
    process.on("uncaughtException", (err: Error) => {
        console.error("Uncought exception", err);
        if (err && err.stack) {
            console.error(err.stack);
        }
        console.log("Error detected, server is NOT exiting...");
    });

    const errorWithSocketClose = (err: Error, socket: Socket) => {
        console.error(err);
        if (err.stack) {
            console.error(err.stack);
        }
        socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
        socket.destroy();
    };

    console.info("Server is starting...");

    const server: any = httpShutdown(http.createServer(app));

    const shutDown = () => {
        console.log("\nServer is shutting down...");
        server.shutdown();
    };

    http.globalAgent.maxSockets = Infinity;

    server.on("error", errorWithSocketClose);
    server.on("clientError", errorWithSocketClose);
    process.on("SIGTERM", shutDown);
    process.on("SIGINT", shutDown);

    return server;
};
