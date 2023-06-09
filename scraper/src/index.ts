import * as puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import Config from './types/configs';
import scrapeLinkedIn from './functions/scrapeLinkedIn';
import scrapeLinkedInPeople from './functions/scrapePeopleLinkedin';

dotenv.config();

let browser: any = null;

const init = (async() => {
  if (!process.env.LINKEDIN_USERNAME || !process.env.LINKEDIN_PASSWORD) {
    throw new Error(`No LinkedIn credentials provided!`);
  }
  
  console.log("Successfully connected")
  
  const config: Config = JSON.parse(fs.readFileSync(`./config.json`).toString());

  browser = await puppeteer.launch({ headless: false,
            executablePath: process.env.CHROME_BIN || undefined,
            args: [`--no-sandbox`, `--disable-gpu`, `--disable-dev-shm-usage`, 
            `--user-agent=${config.userAgent}`,
            `--user-data-dir=/tmp/user_data/`,
            `--start-maximized`] });
  
  // Change this into scrapePeopleList to scrap people profile link or people datas
  scrapePeopleList(browser, config);
});

const scrape = async(browser: any, config: Config) => {
  let outputStr = `job name,job level,company name,city,area,country,skills\n`;
  outputStr += await scrapeLinkedIn(0, browser, config, process.env.LINKEDIN_USERNAME as string, process.env.LINKEDIN_PASSWORD as string);

  fs.writeFileSync(`tutor-ex.csv`, outputStr);
};

const scrapePeopleList = async(browser: any, config: Config) => {
  let outputStr = `personName, experiences, skills, city, area, country\n`;
  //let outputStr = ``;
  outputStr += await scrapeLinkedInPeople(0, browser, config, process.env.LINKEDIN_USERNAME as string, process.env.LINKEDIN_PASSWORD as string);

  fs.writeFileSync(`people.csv`, outputStr);
};

init();