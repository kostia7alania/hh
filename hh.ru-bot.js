const coverLetterText = 'Добрый день! Рассмотрите пожалуйста мою кандидатуру на данную вакансию!';

const errors = [];
const withCoverLetter = [];
const alreadyResponded = [];

const addedToBlacklist = [];
const alreadyAddedToBlacklist = [];

const log = (...args) =>
    console.info(
        {
          errors,
          withCoverLetter,
          alreadyResponded,
          addedToBlacklist,
          alreadyAddedToBlacklist,
        },
        ...args,
    );

const triggerInputChange = (node, value = '') => {
  const inputTypes = [window.HTMLInputElement, window.HTMLSelectElement, window.HTMLTextAreaElement];

  // only process the change on elements we know have a value setter in their constructor
  if (inputTypes.indexOf(node.__proto__.constructor) > -1) {
    const setValue = Object.getOwnPropertyDescriptor(node.__proto__, 'value').set;
    const event = new Event('input', { bubbles: true });

    setValue.call(node, value);
    node.dispatchEvent(event);
  }
};

const wait = (ms = 100) => new Promise((res) => setTimeout(res, ms));

let prevLoc = window.location.href;

const checkLocAndRedirectBack = async () => {
  await wait(1500);
  const newLoc = window.location.href;

  console.info({ newLoc, prevLoc, areSame: newLoc === prevLoc });

  if (newLoc !== prevLoc) {
    console.info('GO BACK from: ', newLoc);

    window.history.back();
    await hideVacancyWithRedirect();
  }
};

const hideVacancyWithRedirect = async () => {
  await wait(1500);
  console.info('HIDE VACANCY');
  const hideButton = document.querySelector('[data-qa=vacancy__blacklist-show-add]');
  hideButton.click();

  await wait(500);

  const hideThisVacancy = document.querySelector('[data-qa=vacancy__blacklist-menu-add-vacancy]');
  hideThisVacancy.click();

  const vacancyElement = document.querySelector('.vacancy-search-item__card');
  vacancyElement.remove();

  prevLoc = window.location.href;

  await runTasks();
};

const runTasks = async () => {
  const items = document.querySelectorAll('.serp-item_link');

  for (const [index, item] of items.entries()) {
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    item.style.boxShadow = '0 0 5px red';

    const jobTitle = item.querySelector('.serp-item__title-link')?.innerText;
    const jobHref = item.querySelector('.serp-item__title-link-wrapper a')?.href;

    console.info(jobTitle);
    console.info(jobHref);

    const target = item.querySelector('.bloko-button_kind-primary');

    if (['Respond', 'Откликнуться'].includes(target?.innerText)) {
      log(index, 'RESPOND', item);

      target.click();
      await wait(1500);
      await checkLocAndRedirectBack();

      // Вы откликаетесь на вакансию в другой стране
      document.querySelector('.bloko-modal-footer .bloko-button_kind-success')?.click();

      const coverLetter = document.querySelector('[data-qa=vacancy-response-popup-form-letter-input]');

      if (coverLetter) {
        triggerInputChange(coverLetter, coverLetterText);

        withCoverLetter.push({ title: jobTitle, href: jobHref });
      }

      document.querySelector('.bloko-modal-footer .bloko-button_kind-primary')?.click();

      await wait(1111);

      const errorText = document.querySelector('.vacancy-response-popup-error')?.innerText;

      if (errorText) {
        errors.push({ title: jobTitle, href: jobHref, error: errorText });
        document.querySelector('[data-qa=vacancy-response-popup-close-button]')?.click(); // close modal
        continue;
      }
    } else {
      alreadyResponded.push({ title: jobTitle, href: jobHref });
      log(index, 'already RESPONDED', item);
    }

    await wait(100);

    const blacklist = item.querySelector('[data-qa=vacancy__blacklist-show-add]');

    if (blacklist) {
      blacklist.click();
      await wait(100);
      document.querySelector('[data-qa=vacancy__blacklist-menu-add-vacancy]').click();

      addedToBlacklist.push({ title: jobTitle, href: jobHref });
      log(index, 'TO BLACK LIST', item);
    } else {
      alreadyAddedToBlacklist.push({ title: jobTitle, href: jobHref });
      log(index, 'already blacklisted', item);
    }

    await wait(1000);
    item.style.boxShadow = '';
  }

  const next = document.querySelector('[data-qa="pager-next"]');

  if (next) {
    next.click();
    await wait(4000);
    runTasks();
    log('GO TO NEXT PAGE');
  }
};

runTasks();
