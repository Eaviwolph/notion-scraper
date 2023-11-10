import { Client } from "@notionhq/client";

import * as fs from 'fs';
import { startServer } from "./commands/server";

require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

if (!fs.existsSync('~dev')) {
    fs.mkdirSync('~dev');
}

startServer(notion);
