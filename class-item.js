class Item {

    constructor() {
        this.itemName = 'item';
    }
    use() {
        console.log('I am an item');
    }
}
class Knife extends Item {
    constructor() {
        super();
        this.name = 'knife'
    }
    use() {
        console.log('I am a knife');
    }
}

class Flashlight extends Item {
    constructor() {
        super();
        this.name = 'flashlight'
    }
    use() {
        console.log('I am a flashlight')
    }
}

const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);
function ask(questionText) {
    return new Promise((resolve, reject) => {
        readlineInterface.question(questionText, resolve);
    });
    knife = new Knife();
    flashlight = new Flashlight();
    let lookupTable = {
        knife: knife,
        flashlight: flashlight

    }


    async function start() {


        while (true) {
            let answer = await ask('>_');
            userAction = answer.toLowerCase().trim();
            // parse user input into two distinct fieds (1)action (first word) and (2)target (remaining words)
            let inputArray = userAction.split(' ')
            let action = inputArray[0]
            let target = inputArray.splice(1).join(' ');

            lookupTable[target].use();
            process.exit();
        }
    }
    start();


}   