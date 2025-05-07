console.log("Email writter extension- content script loaded!");

function createAIButton(){
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI reply');
    return button;
}

function findComposeToolbar(){
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];

    for(const selector of selectors){
        const toolbar = document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
        return null;
    }
}

function getEmailContent(){
    const selectors = [
        '.h7',
        '.a3s.aIL',
        'gmail_quote',
        '[role="presentation"]'
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return '';
    }
}

function injectButton(){
    const existingButtion = document.querySelector('.ai-reply-button');
    if(existingButtion) existingButtion.remove();

    const toolbar = findComposeToolbar();

    if(!toolbar){
        console.log("Toolbar not foudn!");
        return;
    }
    console.log("Toolbar found!");

    const button = createAIButton();
    button.classList.add('.ai-reply-button');

    button.addEventListener('click', async () =>{
        try{
            button.innerHTML = 'Generating...';
            button.disabled = true; 

            const emailContent = getEmailContent();

           const response = await fetch('https://mailmuse-ai.onrender.com/api/email/generate',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                })
            });

            if(!response.ok){
                  throw new Error("Api request failed!");
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box was not found');
            }
        }catch(err){
            console.error(err);
            alert('Failed to generate reply');

        }finally{
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
    
}

const observer = new MutationObserver((mutations)=>{
    for(const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true  
})