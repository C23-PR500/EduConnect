import Config from "../types/configs";
import * as fs from 'fs';
import * as readline from 'readline';

const SCRAPE_AMOUNT = 25;
const SCRAPE_BATCH = 30;
const START_INDEX = 303;

const LINKEDIN_LOGIN_PAGE = `https://linkedin.com/login`;
const LINKEDIN_LOGIN_BUTTON = `.btn__primary--large.from__button--floating`;

const LINKEDIN_PEOPLE_TITLE_LINK_CLASS = `ul.reusable-search__entity-result-list.list-style-none > li.reusable-search__result-container > div > div > div.entity-result__content.entity-result__divider.pt3.pb3.t-12.t-black--light > div.mb1 > div.t-roman.t-sans > div > span.entity-result__title-line.entity-result__title-line--2-lines > span > a`;
const LINK_REGEX = /^[^?]+/;

const LOCATION_CLASS = `div > div.mt2.relative > div.pv-text-details__left-panel.mt2 > span.text-body-small.inline.t-black--light.break-words`;
const PERSON_NAME_CLASS = `div.ph5 > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > h1`;

const EXPERIENCES_TITLE_CLASS = `div.scaffold-finite-scroll__content > ul > li > div > div > div.display-flex.flex-column.full-width.align-self-center > div > div.display-flex.flex-column.full-width > div > span > span:nth-child(1)`;
const EXPERIENCES_SUBTITLE_CLASS = `div.scaffold-finite-scroll__content > ul > li > div > div > div.display-flex.flex-column.full-width.align-self-center > div.display-flex.flex-row.justify-space-between > a > div > span > span:nth-child(1)`

const SKILLS_CLASS = `div.pvs-list__container > div > div > ul > li > div > div > div.display-flex.flex-column.full-width.align-self-center > div.display-flex.flex-row.justify-space-between > a > div > span > span:nth-child(1)`;

const EDUCATION_CLASS = `div.scaffold-finite-scroll__content > ul > li > div > div > div.display-flex.flex-column.full-width.align-self-center > div.display-flex.flex-row.justify-space-between > a > span:nth-child(2) > span:nth-child(1)`;

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
  await page.waitForTimeout(9000);

  // change scrapePeopleIter to scrape each person data
  // change scrapePeopleLink to scrape each person link
  return await scrapePeopleIter(iter, browser, page, config);
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

const scrapePeopleIter = async(jobId: number, browser: any, page: any, config: Config) => {
  let profileLinks: any[] = readProfileLink();
  let returnStr: string = ``;
  const newpage = await browser.newPage();
  await page.goto(config.urls.linkedin[jobId]);

  
  for (let i = START_INDEX; i < SCRAPE_AMOUNT+START_INDEX; i++) {
    if(i >= profileLinks.length) {
      console.log("Stopped, end of profile");
      break;
    }
    let personName: string = ``;
    let personLocation: string = ``;
    let experiencesTitle: string = ``;
    let skills: string = ``;
    let degrees: string = ``;
    let personCity: string = '';
    let personArea: string = '';
    let personCountry: string = '';

    console.log("Index scraped: ", i);
    try {
      await page.goto(profileLinks[i]);
      // person name
      personName = await raceFunction(page, PERSON_NAME_CLASS, false, ``);
    } catch(e) {
      console.log(e);
    }

    try {
      // location 
      personLocation = await scrapElement(page, LOCATION_CLASS);
      const personLocationArr: string[] = personLocation.split(`, `);
      if (personLocationArr.length == 1)
        personArea = personLocationArr[0];
      else if (personLocationArr.length == 2) {
        personArea = personLocationArr[0];
        personCountry = personLocationArr[1];
      } else if (personLocationArr.length == 3) {
        personCity = personLocationArr[0];
        personArea = personLocationArr[1];
        personCountry = personLocationArr[2];
      }  
      personCity = personCity.replace(/,/g, '');
      personArea = personArea.replace(/,/g, '');
      personCountry = personCountry.replace(/,/g, '');
    } catch(e) {
      console.log(e);
    }

    try {
      // experiences title
      experiencesTitle = await raceFunction(page, EXPERIENCES_TITLE_CLASS, true, profileLinks[i]+`/details/experience/`);
    } catch(e) {
      console.log(e);
    }

    try {
      experiencesTitle += ` + ` + await raceFunction(page, EXPERIENCES_SUBTITLE_CLASS, true, ``);
    } catch(e) {
      console.log(e);
    }

    try {
      // education / degrees
      degrees = await raceFunction(page, EDUCATION_CLASS, true, profileLinks[i]+`/details/education/`);
    } catch(e) {
      console.log(e);
    }

    try {
      // skills
      skills = await raceFunction(page, SKILLS_CLASS, true, profileLinks[i]+`/details/skills/`);
    } catch(e) {
      console.log(e);
    }
    returnStr += `${personName}, ${experiencesTitle}, ${skills}, ${personCity}, ${personArea}, ${personCountry}\n`;
  }

  console.log("Stopped, end of profile");
  await page.close();
  return returnStr;
};

const scrapElement = async(page: any, link: string) => {
  await page.waitForSelector(link);
  const elementEl: any = await page.$(link);
  const elements: string = (await elementEl.evaluate((el: any) => el.textContent)).trim();
  return elements
}

const scrapManyElements = async(page: any, link: string) => {
  let elementStr: string = '';
  await page.waitForSelector(link);
  const elementList: any[] = await page.$$(link);
  const elements: string[] = await Promise.all(elementList.map(async (elementItem: any) => {
    let element: string = await elementItem.evaluate((el: any) => el.textContent);
    return element.trim();
  }));
  if (elements.length > 0)
    elementStr = elements.join(' + ');  
  return elementStr;
}

const raceFunction = async(page: any, link: string,  many: boolean, goto: string) => {
  try {
    if(goto.length > 0){
      await page.goto(goto);
    }
    const strPromise = new Promise<string>(async (resolve, reject) => {
      try {
        let str = ``;
        if(many){
          str = await scrapManyElements(page, link);
        }else{
          str = await scrapElement(page, link);
        }
        const cleanedstr = str.replace(/,/g, '');
        resolve(cleanedstr);
      } catch (error) {
        reject(error);
      }
    });
  
    const timeoutPromise = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout occurred'));
      }, 3000); // Set the timeout duration in milliseconds (e.g., 5000 for 5 seconds)
    });
  
    const result = await Promise.race([strPromise, timeoutPromise]);
    // Handle the result
    return result;
  } catch (e) {
    console.log(e);
    return "";
  }
}

export default scrapeLinkedInPeople;