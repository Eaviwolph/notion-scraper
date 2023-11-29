import { Client } from "@notionhq/client";

import * as fs from 'fs';
import { startServer } from "./commands/server";
import { notionDisplay } from "./commands/notionDisplay";
import { populateAthena } from "./commands/populateAthena";

require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_KEY });

if (!fs.existsSync('~dev')) {
    fs.mkdirSync('~dev');
}

if (process.env.COMMAND === "server") {
    console.log("Starting server");
    startServer(notion);
} else if (process.env.COMMAND === "notionDisplay") {
    console.log("Starting notion display");
    notionDisplay(notion);
} else if (process.env.COMMAND === "populateAthena") {
    console.log("Starting populate athena");
    populateAthena(notion);
}
