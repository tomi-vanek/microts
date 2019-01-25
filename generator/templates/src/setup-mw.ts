import * as cors from "cors";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
// TODO: If microservice has file uploads, enable this middleware
// import * as multer from "multer";

import { Request, Response, NextFunction } from "express";

import { cfg } from "./config/app-config";

const healthRedirect = (req: Request, _res: Response, next: NextFunction) => {
    // Health check for cloud deployment
    const healthCheckPath = "/health";
    if (cfg.swaggerSchema.paths[ healthCheckPath ].get && req.path === healthCheckPath) {
        req.url = cfg.swaggerSchema.basePath + healthCheckPath;
        console.log("healthcheck url rewrite", req.path, req.url);
    }
    next();
};

const loggingMW = morgan("short");
const corsMW = cors();
const bodyParserMW = bodyParser.urlencoded({ extended: true });
const jsonParserMW = bodyParser.json({ strict: false, limit: "50mb" });

// TODO: If microservice has file uploads, enable middleware `multerMW`
// The `multerMW` colides with JSON in body - has to be used only for specific endpoint(s)
// const multerMW = multer({
//     limits: { fileSize: 1e6 },
//     storage: multer.memoryStorage(),
// }).single();
// const multerBodyMW = (req, res, next) => {
//     // TODO: replace 'upload' with field name(s) for file upload in swagger schema
//     req.body.upload = req.file ? req.file.buffer.length : "none";
//     next();
// };


const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        console.error("HTTP headers sent - error is forwarded to next handler.");
        return next(err);
    } else if (err.name === "ValidationError" || err.name === "SyntaxError") {
        // validation and syntax errors are responded with status code 400
        res.status(400).json(err);
    } else {
        console.error("Error", err);
        return next(err);
    }
};

const logErrors = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
    if (err) {
      console.error(err.stack);
    }
    next(err);
};

export const setupMW = (app) => {
    // entry middleware
    app.use(loggingMW);
    app.use(corsMW);
    app.use(healthRedirect);

    // input validation & formatting middleware
    app.use(bodyParserMW);
    app.use(jsonParserMW);
    // TODO: For file uploads - enable this middleware
    // app.use(multerMW, multerBodyMW);

    // TODO: add application-specific middleware
};

export const setupErrorHandlingMW = (app) => {
    app.use(logErrors);
    app.use(errorHandler);
};
