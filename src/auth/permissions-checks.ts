import * as e from 'express';

export type PermissionsCheck = (req: e.Request) => Promise<boolean>;

export class PermissionsChecks {} //Add permissions checks here, each one should accept the request, do some work, and return a boolean response
