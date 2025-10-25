import fs from 'fs';
import path from 'path';
import { Application, Router } from 'express';
import { logger } from "@/server";

/**
 * Converts camelCase to kebab-case
 */
function camelToKebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Automatically registers route handlers in the src/api directory
 */
export function setupAutoRoutes(app: Application, basePath: string = path.join(process.cwd(), 'src', 'api')): void {
  if (!fs.existsSync(basePath)) {
    logger.error(`Directory ${basePath} does not exist`);
    return;
  }

  const directories = fs.readdirSync(basePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  directories.forEach(directory => {
    const directoryPath = path.join(basePath, directory);
    const routerFilePath = path.join(directoryPath, `${directory}.router`);
    // Try both .ts and .js extensions
    const tsPath = `${routerFilePath}.ts`;
    const jsPath = `${routerFilePath}.js`;

    const resolvedPath = fs.existsSync(tsPath) ? tsPath :
      fs.existsSync(jsPath) ? jsPath : null;

    if (!resolvedPath) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const routerModule = require(resolvedPath);
      const routerName = `${directory}Router`;

      const router: Router | undefined = routerModule[routerName];

      if (!router) {
        logger.warn(`Could not find exported router '${routerName}' in ${resolvedPath}`);
        return;
      }

      const routePath = `/api/${camelToKebabCase(directory)}`;
      app.use(routePath, router);
      logger.info(`Registered route: ${routePath} -> ${routerName}`);
    } catch (error) {
      logger.error(`❌ Error setting up route for "${directory}" from file: ${resolvedPath}`);
      logger.error(error instanceof Error ? error.stack : error);
      logger.error(`Error setting up route for ${directory}:`, error);
    }
  });
}
