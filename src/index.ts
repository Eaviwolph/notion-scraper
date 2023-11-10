import { Client } from "@notionhq/client";

import * as fs from 'fs';
import { startServer } from "./commands/server";
import { notionDisplay } from "./commands/notionDisplay";

require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

if (!fs.existsSync('~dev')) {
    fs.mkdirSync('~dev');
}

if (process.env.COMMAND === "server") {
    startServer(notion);
} else if (process.env.COMMAND === "notionDisplay") {
    notionDisplay(notion);
}