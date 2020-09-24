class Player {

    constructor(name) {
        this.name = name;
        this.inventory = [];
        this.status = ['healthy', 'full'];
        this.currentRoom = 1;
        this.currentColumn = 1;
        this.currentRow = 1;
    }

    move(direction) {
        switch (direction) {
            case 'north':
                this.currentRow -= 1;
                break;
            case 'south':
                this.currentRow += 1;
                break;
            case 'east':
                this.currentColumn += 1;
                break;
            case 'west':
                this.currentColumn -= 1;
                break;
            default:
                console.log('Direction must be north, south, east or west.');
                break;

        }
    }

    // Add an item to Players inventory
    addItem(item) {
        this.inventory.push(item);
    }

    // Display the description of the current room for the player
    observe() {
        
        for (const element of roomMap) {

            if (element.column === this.currentColumn &&
                element.row === this.currentRow) {
                console.log('Room: ' + element.name + ' ' + element.description);
            }
        }
        //return roomMap[this.currentRoom - 1].description;
    }

    // Take an item in a room
    take(item) {

        let index = 0;

        // check to see if item player wants to take is in room and if so add to player inventory
        for (const element of roomMap[this.currentRoom - 1].takeableItems) {
            index += 1;
            if (element === item) {
                this.addItem(item);
                roomMap[this.currentRoom - 1].takeableItems = roomMap[this.currentRoom - 1].takeableItems.slice(index);
            }
        }
    }

    // Display the items that a player has in their inventory
    showInventory() {
        for (const element of this.inventory) {
            console.log(element + '\n');
        }
    }
}

class Room {
    constructor(roomNumber, column, row, name, description, takeableItems) {
        this.roomNumber = roomNumber;
        this.column = column;
        this.row = row;
        this.name = name;
        this.description = description;
        this.takeableItems = takeableItems;
    }

    // Show the items that exist in a room
    showItems() {
        for (const element of this.takeableItems) {
            console.log(element);
        }
    }
}

let roomMap = [];
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        readlineInterface.question(questionText, resolve);
    });
}

start();

async function start() {
    console.log('\n\n');
    console.log(`You have worken up in a strange house that you are unfamilar with.\nYour task now is to find your way out safely.\nBeware as the house is filled with surprises, some of which could be your demise.\n`);
    console.log('To find your way through the house, you can type the following commands:\n');
    console.log('Move North, Move South, Move East, Move West - to move through the house');
    console.log('Take - to pick up an item in a room and put it in your backpack.');
    console.log('Observe - to see a description of the room you are current in and the items that exist in it.');
    console.log('Use - to use an item that you have in your backpack.')


    // Create the Rooms:  Room Number, Col, Row, Name, Description, Takeable Items[]
    roomMap.push(new Room(1, 1, 1, 'Library', 'You are in the library.  There is a desk in the middle of the room and a bookcase against the wall.\nThere are no doors.', ['vial', 'book']));
    roomMap.push(new Room(2, 2, 3, 'Study', 'There\'s a large desk against wall and several chairs throughout the room.', ['cookie', 'key']));
    roomMap.push(new Room(3, 2, 1, 'Kitchen', 'There\'s a butcher\'s block on the counter with one knife in it.', ['knife']));
    roomMap.push(new Room(4, 2, 2, 'Dining Room', 'You are in a beautiful dining room.  There\'s a long wooden dinner table with a glass of wine on it.', ['wine']));

    let player = new Player('Dakota');

    while (true) {
        let answer = await ask('>_');
        if (answer === 'exit') {
            console.log('Thanks for playing!');
            process.exit();
        }
        else if (answer === 'north'
            || answer === 'south'
            || answer === 'east'
            || answer === 'west') {
            player.move(answer);
        }
        else if (answer === 'observe') {
            player.observe();
        }
    }
}
