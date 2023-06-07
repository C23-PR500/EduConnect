import Config from "../types/configs";
import * as fs from 'fs';
import * as readline from 'readline';

// Jobs to be scraped. From my observation this number varies from 18-25, I don't really know what to do about it
const SCRAPE_AMOUNT = 10;
const SCRAPE_BATCH = 30;

const LINKEDIN_LOGIN_PAGE = `https://linkedin.com/login`;
const LINKEDIN_LOGIN_BUTTON = `.btn__primary--large.from__button--floating`;

const LINKEDIN_PEOPLE_CARD_CLASS = `ul.reusable-search__entity-result-list.list-style-none > li.reusable-search__result-container`
const LINKEDIN_PEOPLE_TITLE_LINK_CLASS = `ul.reusable-search__entity-result-list.list-style-none > li.reusable-search__result-container > div > div > div.entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > div.mb1 > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a`;
const LINKEDIN_PEOPLE_NAME_CLASS = `div.ph5.pb5 > div.mt2.relative > div.pv-text-details__left-panel.pv-text-details__left-panel--full-width > div:nth-child(1) > h1`;
const LINKEDIN_JOB_LOCATION_CLASS = `.jobs-unified-top-card__bullet`;
const LINKEDIN_JOB_SKILL_ITEM_SELECTOR = `div > div:nth-child(1) > ul > li > div.display-flex.align-items-center > div:nth-child(2)`;
const LINK_REGEX = /^[^?]+/;

const scrapeLinkedInPeople = async(iter: number, browser: any, config: Config, linkedInUsername: string, linkedInPassword: string) => {
  const context: any = await browser.createIncognitoBrowserContext();
  const page: any = await context.newPage();
  await page.setUserAgent(config.userAgent);

  await page.goto(LINKEDIN_LOGIN_PAGE);

  await page.$eval('input#username', (el: any, linkedInUsername: string) => {
    el.value = linkedInUsername
  }, linkedInUsername);
  
  await page.$eval('input#password', (el: any, linkedInPassword: string) => {
    el.value = linkedInPassword
  }, linkedInPassword);

  await page.$eval(LINKEDIN_LOGIN_BUTTON, (btn: any) => btn.click());
  
  await page.waitForNavigation();
  await page.waitForTimeout(1000);
  await page.waitForTimeout(2000);

  // change scrapePeopleIter to scrape each person data
  // change scrapePeopleLink to scrape each person link
  return await scrapePeopleIter(iter, page, config);
};

const scrapePeopleLink = async(jobId: number, page: any, config: Config) => {
  await page.goto(config.urls.linkedin[jobId]);
  let returnStr: string = ``;

  for(let j=1; j<= SCRAPE_BATCH; j++){
    // next button
    //const buttonXPath = `button[@aria-label='Next']`; // Replace 'Next' with the desired aria-label value

    // people linkedin link
    await page.waitForSelector(LINKEDIN_PEOPLE_TITLE_LINK_CLASS);
    const rawLink: any[] = await page.$$eval(LINKEDIN_PEOPLE_TITLE_LINK_CLASS, (anchors: any) => {
      return anchors.map((anchor: any) => anchor.href);
    });
    for(let i = 0; i < rawLink.length; i++) {
      let index = i;
      if (index >= rawLink.length) index = rawLink.length - 1;
      let raw = rawLink[index];
      let processedLink = raw.match(LINK_REGEX)[0];
      returnStr += `${processedLink}\n`;
    }
    console.log("BATCH: ", j);
    //await page.$eval(buttonXPath, (btn: any) => btn.click());
    await page.waitForNavigation();
  }
  page.close();
  return returnStr;
}

// read every people links
const readProfileLink = () => {
  const filePath = 'people-link-final.txt';
  let returnArray : any[] = [];
  try {
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContents.split('\n');

    lines.forEach((line) => {returnArray.push(line)});
  } catch (err) {
    console.log(err);
  }
  return returnArray;
}

const scrapePeopleIter = async(jobId: number, page: any, config: Config) => {
  let profileLinks: any[] = readProfileLink();
  let returnStr: string = ``;

  for (let i = 0; i < SCRAPE_AMOUNT; i++) {
    await page.waitForSelector(LINKEDIN_PEOPLE_CARD_CLASS);
    await page.waitForTimeout(1000);
    cards = await page.$$(LINKEDIN_PEOPLE_CARD_CLASS);
    
    let index = i;

    if (index >= cards.length)
      index = cards.length - 1;

    await cards[index].click();
    //await page.$eval(LINKEDIN_PEOPLE_TITLE_LINK_CLASS, (btn: any) => btn.click());
    
    try {
      await page.waitForSelector(LINKEDIN_PEOPLE_NAME_CLASS);
      const personNameEl: any = await page.$(LINKEDIN_PEOPLE_NAME_CLASS);
      const personName: string = await personNameEl.evaluate((el: any) => el.textContent);

      await page.waitForSelector(LINKEDIN_JOB_LOCATION_CLASS);
      const jobLocationEl: any = await page.$(LINKEDIN_JOB_LOCATION_CLASS);
      const jobLocation: string = (await jobLocationEl.evaluate((el: any) => el.textContent)).trim();
      let personCity = '';
      let personArea = '';
      let personCountry = '';

      const jobLocationArr: string[] = jobLocation.split(`, `);
      if (jobLocationArr.length == 1)
        personArea = jobLocationArr[0];
      else if (jobLocationArr.length == 2) {
        personArea = jobLocationArr[0];
        personCountry = jobLocationArr[1];
      } else if (jobLocationArr.length == 3) {
        personCity = jobLocationArr[0];
        personArea = jobLocationArr[1];
        personCountry = jobLocationArr[2];
      }


      const jobUrl: string = (await page.evaluate(() => document.location.href)).split('?')[0];

      // skills
      let skillStr = scrapManyElements(page, LINKEDIN_JOB_SKILL_ITEM_SELECTOR);

      returnStr += `${personName},${personCity},${personArea},${personCountry}\n`;

    } catch(e) {
      console.log(e);
    }

    await page.goBack();
  }
  await page.close();
  return returnStr;
};

const scrapManyElements = async(page: any, link: string) => {
  await page.waitForSelector(link);
  const elementList: any[] = await page.$$(link);
  const elements: string[] = await Promise.all(elementList.map(async (elementItem: any) => {
    let element: string = await elementItem.evaluate((el: any) => el.textContent);
    return element.trim();
  }));
  let elementStr: string = '';
  if (elements.length > 0)
    elementStr = elements.join('+');  
  return elementStr
}

export default scrapeLinkedInPeople;