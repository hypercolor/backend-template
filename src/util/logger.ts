
import winston from "winston";
import { PapertrailTransport } from "winston-papertrail-transport";

const PapertrailConfig = {
    PAPERTRAIL_HOST: process.env.PAPERTRAIL_HOST,
    PAPERTRAIL_PORT: process.env.PAPERTRAIL_PORT
}

// By default, set up a logger that just ignores everything
// This is for localhost dev work, when PAPERTRAIL_HOST etc are not set

let logger = {
    info: (..._: Array<any>) => {
        /* Do nothing */
    },
    warn: (..._: Array<any>) => {
        /* Do nothing */
    },
    error: (..._: Array<any>) => {
        /* Do nothing */
    },
};

let papertrailFound = false;
if (PapertrailConfig.PAPERTRAIL_HOST && PapertrailConfig.PAPERTRAIL_PORT) {
    papertrailFound = true;
    const papertrailTransport = new PapertrailTransport({
        host: PapertrailConfig.PAPERTRAIL_HOST,
        port: parseInt(PapertrailConfig.PAPERTRAIL_PORT),
        program: `${process.env.APP_NAME}-${process.env.ENVIRONMENT_NAME}`,
        flushOnClose: true,
    });

    // Direct ref to process.env.PAPERTRAIL_X so we dont depend on Config, so Config errors will get logged
    // const winstonPapertrail = new winston.transports.Papertrail({
    //     host: process.env.PAPERTRAIL_HOST,
    //     port: process.env.PAPERTRAIL_PORT,
    //     colorize: true,
    //     program: `${process.env.APP_NAME}-${process.env.ENVIRONMENT_NAME}`,
    //     handleExceptions: true,
    // });

    papertrailTransport.on("error", function (err: any) {
        Logger.error("papertrail err: ", err); // eslint-disable-line no-console
    });

    logger = winston.createLogger({
        transports: [papertrailTransport],
    });
}

const isProduction = process.env.NODE_ENV === "production";

export class Logger {
    public static logCritical(...args: Array<any>) {
        const msg = this.buildMessage(...args);
        // if (!isProduction) {
        console.log(msg); // eslint-disable-line no-console
        // }
        logger.info(msg);
    }

    public static log(...args: Array<any>) {
        const msg = this.buildMessage(...args);
        if (!isProduction || !papertrailFound) {
            console.log(msg); // eslint-disable-line no-console
        }
        logger.info(msg);
    }

    public static warn(...args: Array<any>) {
        const msg = this.buildMessage(...args);
        if (!isProduction || !papertrailFound) {
            console.warn(msg); // eslint-disable-line no-console
        }
        logger.warn(msg);
    }

    public static error(...args: Array<any>) {
        const msg = this.buildMessage(...args);
        // if (!isProduction) {
        console.error(msg); // eslint-disable-line no-console
        // }
        logger.error(msg);
    }

    private static buildMessage(...args: Array<any>) {
        return args.join(" ");
    }
}
