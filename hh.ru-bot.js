coverLetterText = 'Добрый день! Рассмотрите, пожалуйста!'

errors = []
withCoverLetter = []
alreadyResponded = []

addedToBlacklist = []
alreadyAddedToBlacklist = []

log = (...args) => console.log({ errors, withCoverLetter, alreadyResponded, addedToBlacklist, alreadyAddedToBlacklist }, ...args)

triggerInputChange = (node, value = '') => {
    inputTypes = [
        window.HTMLInputElement,
        window.HTMLSelectElement,
        window.HTMLTextAreaElement,
    ];

    // only process the change on elements we know have a value setter in their constructor
    if ( inputTypes.indexOf(node.__proto__.constructor) >-1 ) {

        const setValue = Object.getOwnPropertyDescriptor(node.__proto__, 'value').set;
        const event = new Event('input', { bubbles: true });

        setValue.call(node, value);
        node.dispatchEvent(event);
    }
};


wait = (ms = 100) => new Promise(res=>setTimeout(res, ms))

prevLoc = window.location.href

navigation.addEventListener('navigate', (e) => {
    // TODO: think about preventing leave the page
   console.error('GO BACK',e.destination.url)
    e.preventDefault()
    e.stopPropagation()
    e.stopImmediatePropagation()
    // history.back()
    window.location.href = prevLoc
})

Object.freeze(document.location);

runTasks = async () => {
    
    const items = document.querySelectorAll('.serp-item')
    for (const [index, item] of items.entries()) {
        item.scrollIntoView({behavior: 'smooth', block: "center"});
        item.style.boxShadow = "0 0 5px red";

        const jobTitle = item.querySelector('.serp-item__title')?.innerText
        const jobHref = item.querySelector('.serp-item__title')?.href

        const target = item.querySelector('.bloko-button_kind-success')
        
        if (target?.innerText === 'Respond') {
            log(index, 'RESPOND', item)
            
            target.click()
            await wait(2000)

            const coverLetter = document.querySelector('[data-qa=vacancy-response-popup-form-letter-input]')

            if(coverLetter) {
                
                triggerInputChange(coverLetter, coverLetterText)
                                
                withCoverLetter.push({ title: jobTitle, href: jobHref })
            }
            
            
            document.querySelector('.bloko-modal-footer .bloko-button_kind-primary').click()

            await wait(1111)
            
            const errorText = document.querySelector('.vacancy-response-popup-error')?.innerText
            if (errorText) {
                errors.push({ title: jobTitle, href: jobHref, error: errorText })
                document.querySelector('[data-qa=vacancy-response-popup-close-button]')?.click() // close modal
                continue
            }
            
        } else {
            alreadyResponded.push({ title: jobTitle, href: jobHref })
            log(index, 'already RESPONDED', item)
        }

        

         await wait(100)

        const blacklist = item.querySelector('[data-qa=vacancy__blacklist-show-add]')
        
        if(blacklist) {
            blacklist.click()    
            await wait(100)
            document.querySelector('[data-qa=vacancy__blacklist-menu-add-vacancy]').click()
            
            addedToBlacklist.push({ title: jobTitle, href: jobHref })
            log(index, 'TO BLACK LIST', item)
            
        } else {
            alreadyAddedToBlacklist.push({ title: jobTitle, href: jobHref })
            log(index, 'already blacklisted', item)
        }
    
        await wait(1000)
        item.style.boxShadow = "";
    }

    const next = document.querySelector('[data-qa="pager-next"]')
    if(next) {
        next.click()
        await wait(4000)
        runTasks()
        log('GO TO NEXT PAGE')
    }

}

runTasks()
