import * as cors from "cors";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import { Request, Response, NextFunction, Application } from "express";
import { cfg } from "./config/app-config";

export const setupAppMW = (app: Application): void => {
    const loggingMW = morgan("short");
    const corsMW = cors();
    const bodyParserMW = bodyParser.urlencoded({ extended: true });
    const jsonParserMW = bodyParser.json({ strict: false, limit: "50mb" });

    const healthRedirect = (req: Request, _res: Response, next: NextFunction): void => {
        // Health check for cloud deployment
        const healthCheckPath = "/health";
        if (cfg.swaggerSchema.paths[ healthCheckPath ].get && req.path === healthCheckPath) {
            req.url = cfg.swaggerSchema.basePath + healthCheckPath;
            console.log("healthcheck url rewrite", req.path, req.url);
        }
        next();
    };
    app.use(loggingMW);
    app.use(corsMW);
    app.use(healthRedirect);
    app.use(bodyParserMW);
    app.use(jsonParserMW);
};

export const setupErrorHandlingMW = (app: Application): void => {
    const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
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

    const logErrors = (err: Error, _req: Request, _res: Response, next: NextFunction): void => {
        if (err) {
          console.error(err.stack);
        }
        next(err);
    };

    app.use(logErrors);
    app.use(errorHandler);
};

export const setupFormMW = (app: Application): void => {
    const multerMW = multer({
        limits: { fileSize: 200e6 },
        storage: multer.memoryStorage(),
    }).any();

    const multerBodyMW = (fieldName: string) =>
        (req: any, res: Response, next: NextFunction): void => {

        const input: ArrayBuffer = (req.files && req.files[0] && req.files[0].buffer) ?
            req.files[0].buffer as ArrayBuffer : new ArrayBuffer(0);
        req.body.input = input;
        req.body[fieldName] = `size: ${input.byteLength}`;
        next();
    };

    const basePath = cfg.swaggerSchema.basePath;
    const swagger2express = (x: string) => basePath + x.replace(/\{/g, ":").replace(/\}/g, "");

    const pathDefs = cfg.swaggerSchema.paths;
    const paths = Object.keys(pathDefs);
    const pathsWithFormData = paths.filter(p => {
        const def = pathDefs[p];
        const methods = Object.keys(def);
        return methods.find(m => {
            return def[m].parameters &&
                def[m].parameters.find((x: any) => x.in === "formData");
        });
    });

    if (pathsWithFormData && pathsWithFormData.length) {
        pathsWithFormData.forEach(p => {
            const expressPath = swagger2express(p);
            app.use( expressPath, multerMW );

            const def = pathDefs[p];
            const methods = Object.keys(def);
            methods.forEach(m => {
                const params = def[m].parameters;
                if (params) {
                    params.filter((x: any) => x.in === "formData" && x.type === "file")
                        .forEach((x: any) => {
                            app.use( expressPath, multerBodyMW(x.name) );
                        });
                }
            });
        });
    }
};
