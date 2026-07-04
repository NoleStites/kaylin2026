// TODO
// - 

class MessageItem
{
    constructor(text, type, id) {
        this.text = text; // The text to display (words or punctuation)
        this.type = type; // "word" or "punctuation"
        this.id = id;
    }
    
    // Returns an HTML element representing this message item
    // Word and Punctuation items are the same aside from class name so
    // that they can be rendered differently
    createHTML(id)
    {
        let span = document.createElement("span");
        span.innerText = this.text;
        span.id = id;
        span.classList.add("messageItem");
        span.classList.add(this.type);
        return span;
    }
}

// Creates and returns a list of MessageItems
function deconstruct(message)
{
    let words = message.split(' ');
    
    // Separate the punctuation from the words and create MessageItems
    let items = [];
    let count = 0;
    words.forEach(word => {
        let match = word.match(/^([a-zA-Z0-9'-]+)(.*)$/);
        let text = match[1];
        let punctuation = match[2];

        if (text != "") {
            items.push(new MessageItem(text, "word", count));
        }
        if (punctuation != "") {
            items.push(new MessageItem(punctuation, "punctuation", count+1));
            count++;
        }

        count++;
    });

    return items;
}

// Insert the given MessageItems into the DOM for both draggable and message items
// Returns a list of draggable IDs in the order they are displayed
function displayMessageItems(items)
{
    let messageWrapper = document.getElementById("messageWrapper");
    let div = document.createElement("div");

    // Display the message items
    let doPair = false;
    for (let i = 0; i < items.length; i++) {
        // If the previous recognized this as a punctuation, pair with previous
        if (doPair) {
            let pair = div.cloneNode();
            pair.appendChild(items[i-1].createHTML(`item${i-1}`));
            pair.appendChild(items[i].createHTML(`item${i}`));
            messageWrapper.appendChild(pair);
            doPair = false;
            continue;
        }

        // Check if the next item is punctuation and pair them if so
        if (i < items.length-1) {
            if (items[i+1].type == "punctuation") {
                doPair = true;
                continue;
            }
        }

        // Next is not punctuation, so handle normally
        messageWrapper.appendChild(items[i].createHTML(`item${i}`));
    }

    // Display the draggable current words
    let currentWordBox = document.getElementById("currentWordBox");
    let deepCopy = items.map(item => new MessageItem(item.text, item.type, item.id));
    let draggableItems = shuffleArray(deepCopy).filter(item => item.type !== "punctuation"); // Randomized list of words (no punctuation)
    let draggableIDs = [];
    for (let i = 0; i < draggableItems.length; i++) {
        let item = draggableItems[i];
        let itemHTML = item.createHTML(`draggable${item.id}`);
        draggableIDs.push(`draggable${item.id}`);
        itemHTML.classList.add("currentWord");
        itemHTML.setAttribute("data-itemNum", `${item.id}`);
        itemHTML.addEventListener("mousedown", (e) => {
            isDragging = true;

            currentWord = e.target;
            e.target.style.pointerEvents = "none";
            let itemNum = e.target.getAttribute("data-itemNum");
            let targetItem = document.getElementById(`item${itemNum}`);
            targetItem.classList.toggle("highlighted");

            targetItem.addEventListener("mouseenter", () => {
                isHovering = true;
            });
            targetItem.addEventListener("mouseleave", () => {
                isHovering = false;
            });
        });
        currentWordBox.appendChild(itemHTML);
    }
    return(draggableIDs);
}

function shuffleArray(array) {
  // Loop through the array from the last element down to the second
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap elements at indices i and j using destructuring assignment
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Returns a random integer between two given values (exclusive)
function randIntBetween(a, b) {
    return (Math.floor(Math.random() * b) + a);
}

// =====
// START
// =====

// Functionality assumes that the message does not contain double punctuation for !!, ??, ..., etc.
// const message = "This is a test message, so please enjoy it. Say hi! Or will you not?? Who knows?";
const message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
// const message = "Hi there, you."

let items = deconstruct(message);
let draggableIDs = displayMessageItems(items);
document.getElementById(draggableIDs[0]).classList.toggle("active"); // reveal the first word

let content = document.getElementById("content");
let currentWord;
let currentWordIndex = 0;
let isDragging = false;
let isHovering = false; // Is the currentWord on top of the target

window.addEventListener("mouseup", () => {
    isDragging = false;

    if (currentWord) {
        let itemNum = currentWord.getAttribute("data-itemNum");
        let targetItem = document.getElementById(`item${itemNum}`);

        if (!isHovering) {
            currentWord.style.top = "";
            currentWord.style.left = "";
            currentWord.style.pointerEvents = "auto";
        }
        else {
            currentWord.remove();
            currentWordIndex++;
            if (draggableIDs[currentWordIndex]) { // Safe check in case it's the last word
                document.getElementById(draggableIDs[currentWordIndex]).classList.toggle("active");
            }
            targetItem.classList.toggle("placedWord");
        }
        
        targetItem.classList.toggle("highlighted");

        // Remove event listeners by replacing with clone
        let newEl = targetItem.cloneNode(true);
        targetItem.replaceWith(newEl);

        currentWord = null;
        isHovering = false;
    }
});

content.addEventListener("mousemove", (e) => {
    if (!isDragging) {return;}
    let rect = content.getBoundingClientRect();

    // Calculate relative positions
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Move the current word
    currentWord.style.top = y - currentWord.offsetHeight/2 + "px";
    currentWord.style.left = x - currentWord.offsetWidth/2 + "px";
});

// const timeoutId = setTimeout(() => {
//     document.getElementById("messageWrapper").style.background = "url(./wood.jpg)";
// }, 2000);