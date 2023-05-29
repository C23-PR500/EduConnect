import Config from "../types/configs";

// Jobs to be scraped. From my observation this number varies from 18-25, I don't really know what to do about it
const SCRAPE_AMOUNT = 18;

const LINKEDIN_LOGIN_PAGE = `https://linkedin.com/login`;
const LINKEDIN_LOGIN_BUTTON = `.btn__primary--large.from__button--floating`;

const LINKEDIN_CARD_CLASS = `.job-card-container.relative.job-card-list`;
const LINKEDIN_JOB_TITLE_LINK_CLASS = `.jobs-unified-top-card__job-title`;
const LINKEDIN_JOB_TITLE_CLASS = `.jobs-unified-top-card__job-title`;
const LINKEDIN_JOB_DATE_CLASS = `.jobs-unified-top-card__posted-date`;
const LINKEDIN_JOB_LOCATION_CLASS = `.jobs-unified-top-card__bullet`;
const LINKEDIN_JOB_COMPANY_CLASS = `body > div.application-outlet > div.authentication-outlet > div > div.job-view-layout.jobs-details > div.grid > div > div:nth-child(1) > div > div > div.p5 > div.jobs-unified-top-card__primary-description > span.jobs-unified-top-card__subtitle-primary-grouping.t-black > span.jobs-unified-top-card__company-name`;
const LINKEDIN_JOB_TYPE_SELECTOR = `body > div.application-outlet > div.authentication-outlet > div > div.job-view-layout.jobs-details > div.grid > div > div:nth-child(1) > div > div > div.p5 > div.mt5.mb2 > ul > li:nth-child(1) > span`;
const LINKEDIN_JOB_SKILLS_BUTTON_SELECTOR = `button[id^=ember]:nth-child(3):nth-of-type(1)`;
const LINKEDIN_JOB_SKILL_ITEM_SELECTOR = `div > div:nth-child(1) > ul > li > div.display-flex.align-items-center > div:nth-child(2)`;

const scrapeLinkedIn = async(iter: number, browser: any, config: Config, linkedInUsername: string, linkedInPassword: string) => {
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

  return await scrapeLinkedInIter(iter, page, config);
};

const scrapeLinkedInIter = async(jobId: number, page: any, config: Config) => {
  await page.goto(config.urls.linkedin[jobId]);
  let cards: any[] = await page.$$(LINKEDIN_CARD_CLASS);
  let returnStr: string = ``;

  for (let i = 0; i < SCRAPE_AMOUNT; i++) {
    await page.waitForSelector(LINKEDIN_CARD_CLASS);
    await page.waitForTimeout(1000);
    cards = await page.$$(LINKEDIN_CARD_CLASS);
    
    let index = i;

    if (index >= cards.length)
      index = cards.length - 1;

    await cards[index].click();
    await page.$eval(LINKEDIN_JOB_TITLE_LINK_CLASS, (btn: any) => btn.click());
    
    try {
      await page.waitForSelector(LINKEDIN_JOB_TITLE_CLASS);
      const jobTitleEl: any = await page.$(LINKEDIN_JOB_TITLE_CLASS);
      const jobTitle: string = await jobTitleEl.evaluate((el: any) => el.textContent);

      await page.waitForSelector(LINKEDIN_JOB_DATE_CLASS);
      const jobPostedDateEl: any = await page.$(LINKEDIN_JOB_DATE_CLASS);
      const jobPostedDate: string = (await jobPostedDateEl.evaluate((el: any) => el.textContent)).trim();

      await page.waitForSelector(LINKEDIN_JOB_LOCATION_CLASS);
      const jobLocationEl: any = await page.$(LINKEDIN_JOB_LOCATION_CLASS);
      const jobLocation: string = (await jobLocationEl.evaluate((el: any) => el.textContent)).trim();
      let jobCity = '';
      let jobArea = '';
      let jobCountry = '';

      const jobLocationArr: string[] = jobLocation.split(`, `);
      if (jobLocationArr.length == 1)
        jobArea = jobLocationArr[0];
      else if (jobLocationArr.length == 2) {
        jobArea = jobLocationArr[0];
        jobCountry = jobLocationArr[1];
      } else if (jobLocationArr.length == 3) {
        jobCity = jobLocationArr[0];
        jobArea = jobLocationArr[1];
        jobCountry = jobLocationArr[2];
      }

      await page.waitForSelector(LINKEDIN_JOB_COMPANY_CLASS);
      const jobCompanyEl: any = await page.$(LINKEDIN_JOB_COMPANY_CLASS);
      const jobCompany: string = (await jobCompanyEl.evaluate((el: any) => el.textContent)).trim();

      await page.waitForSelector(LINKEDIN_JOB_TYPE_SELECTOR);
      const jobTypeEl: any = await page.$(LINKEDIN_JOB_TYPE_SELECTOR);
      let jobType: string = (await jobTypeEl.evaluate((el: any) => el.textContent)).trim();
      
      if (jobType.includes(` · `))
        jobType = jobType.split(` · `)[1];
      else
        jobType = '';

      const jobUrl: string = (await page.evaluate(() => document.location.href)).split('?')[0];

      await page.waitForSelector(LINKEDIN_JOB_SKILLS_BUTTON_SELECTOR, {
        timeout: 2500
      });
      await page.$eval(LINKEDIN_JOB_SKILLS_BUTTON_SELECTOR, (btn: any) => btn.click());

      await page.waitForSelector(LINKEDIN_JOB_SKILL_ITEM_SELECTOR);

      const skillList: any[] = await page.$$(LINKEDIN_JOB_SKILL_ITEM_SELECTOR);
      const skills: string[] = await Promise.all(skillList.map(async (skillItem: any) => {
        let skill: string = await skillItem.evaluate((el: any) => el.textContent);
        return skill.trim();
      }));

      let skillStr: string = '';

      if (skills.length > 0)
        skillStr = skills.join('+');

      // console.log(jobTitle);
      // console.log(jobPostedDate);
      // console.log(jobCity);
      // console.log(jobArea);
      // console.log(jobCountry);
      // console.log(jobCompany);
      // console.log(jobUrl);
      // console.log(jobType);
      // console.log(skillStr);

      returnStr += `${jobTitle},${jobType},${jobCompany},${jobCity},${jobArea},${jobCountry},${skillStr}\n`;

    } catch(e) {
      console.log(e);
    }

    await page.goBack();
  }
  await page.close();
  return returnStr;
};

export default scrapeLinkedIn;