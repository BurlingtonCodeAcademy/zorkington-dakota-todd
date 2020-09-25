class Player {

    constructor(name) {
        this.name = name;
        this.inventory = [];
        this.status = ['healthy', 'full'];
        this.currentRoom = 1;
        this.currentColumn = 1;
        this.currentRow = 1;
    }
    // Move from room to room
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
                console.log('Direction must be north, south, east, or west.')
                break;
        }

    }
    // Add item into player inventory
    addItem(item) {
        this.inventory.push(item);
    }
    // Display room description
    observe() {
        for (const element of roomMap) {

            if (element.column === this.currentColumn &&
                element.row === this.currentRow) {
                console.log('Room: ' + element.name + ' ' + element.description);
            }
        }
        // return roomMap[this.currentRoom - 1].description;
    }
    // Take item from room & add to inventory
    take(item) {
        let index = 0;
        for (const element of roomMap[this.currentRoom - 1].takeableItems) {
            index += 1;
            if (element === item) {
                this.addItem(item);
                roomMap[this.currentRoom - 1].takeableItems = roomMap[this.currentRoom - 1].takeableItems.slice(index)


            }

        }
    }
    // Show current inventory items
    showInventory() {
        for (const element of this.inventory)
            console.log(element + '\n')

    }
}
class Room {
    constructor(roomNumber, column, row, name, description, takeableItems) {
        this.roomNumber = roomNumber;
        this.column = column;
        this.row = row;
        this.name = name;
        this.description = description;
        this.takeableItems = takeableItems
    }
    // Show items available to add to inventory in each room
    showItems() {
        for (const element of this.takeableItems) {
            console.log(element);
        }
    }
}
const readline = require('readline');
const readlineInterface = readline.createInterface(process.stdin, process.stdout);

function ask(questionText) {
    return new Promise((resolve, reject) => {
        readlineInterface.question(questionText, resolve);
    });
}
let roomMap = [];

start();

async function start() {
    console.log('You\'ve awoken in a dark, unfamiliar house with no memory of how you ended up there.\nThe house looks like it\'s been abandoned for quite some time.\nYou must navigate through the house to find your escape!);
    console.log('To find your way through the house & escape to freedom type the following commands:');
    console.log('North: move north\nSouth: move south\nEast: move east\nWest: move west');
    console.log('Observe: to see a description of your current room');
    console.log('Inspect: to read a description of an item in your inventory');
    console.log('Take: to take an item from a room and add it to inventory');
    console.log('Use: to use an item from your inventory');
    


//Creat new rooms with descriptions & obtainable items

roomMap.push(new Room(1, 1, 1, 'library', 'You are in the library.\nThis room has bookcases from floor to cieling, except one in particular that\'s only a little taller than you are. There\'s a single small desk in the center of the room.' ['note', 'flashlight', 'book']))
roomMap.push(new Room(2, 2, 3, 'study', 'You are in the study.\nThere is a large oak desk in the room with faded portraits hanging on the wall, one seems to be askew...', ['batteries', 'key']))
roomMap.push(new Room(3, 2, 1, 'kitchen', 'You are in the kitchen.\nThe kitchen looks to have been ransacked some time ago.\nMost of the drawers are hanging open with nothing inside.\nThe door to the dining room seems to be locked from the other side.' ['knife']))
roomMap.push(new Room(4, 2, 2, 'dining room', 'You are in the dining room.\nThere is a long wooden dinner table with several empty viles atop it.\nOne empty vial for every seat at the table ...exept one.', ['vial']))


let player = new Player('Dakota');

while (true) {
    let answer = await ask('>_');
    if (answer === 'exit') {
        console.log('Thanks for playing');
        process.exit();
    } else if (answer === 'north' || answer === 'south' || answer === 'east' || answer === 'west') {
        player.move(answer);
    } else if (answer === 'observe') {
        player.observe()
    }
}

}