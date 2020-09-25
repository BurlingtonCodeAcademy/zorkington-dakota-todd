class Item {
    constructor(roomNumber, name, desc, takeable) {
        this.roomNumber = this.roomNumber;
        this.name = name;
        this.description = desc;
        this.takeable = false;
    }
}

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

    inspect(target) {
        let element = 0;
        
        for (const property in items) {
            //console.log('target: '+ target + ' items ' + items[element].name);
            if (target === items[element].name) {
                console.log(items[element].description);
            }
            element += 1;
        }
    }

    // Display room description
    observe() {
        for (const element of roomMap) {

            if (element.column === this.currentColumn &&
                element.row === this.currentRow) {
                console.log(element.description);
            }
        }
    }

    // Show current inventory items
    showInventory() {
        for (const element of this.inventory)
            console.log(element + '\n')

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
let items = [];

start();

async function start() {
    console.log('You\'ve awoken in a dark, unfamiliar house with no memory of how you ended up there.\nThe house looks like it\'s been abandoned for quite some time.\nYou must navigate through the house to find your escape!');
    console.log('To find your way through the house & escape to freedom type the following commands:');
    console.log('North: move north\nSouth: move south\nEast: move east\nWest: move west');
    console.log('Observe: to see a description of your current room');
    console.log('Inspect: to read a description of an item in your inventory');
    console.log('Take: to take an item from a room and add it to inventory');
    console.log('Use: to use an item from your inventory');



    //Create new rooms with descriptions & obtainable items
    // room number, column, row, room name, room description, takeable items in room
    roomMap.push(new Room(1, 1, 1, 'library', 'You are in the library.\nThis room has bookcases from floor to ceiling, except one in particular that\'s only a little taller than you are. There\'s a single small desk in the center of the room.',['note', 'flashlight', 'book']))
    roomMap.push(new Room(2, 2, 3, 'study', 'You are in the study.\nThere is a large oak desk in the room with faded portraits hanging on the wall, one seems to be askew...', ['batteries', 'key']))
    roomMap.push(new Room(3, 2, 1, 'kitchen', 'You are in the kitchen.\nThe kitchen looks to have been ransacked some time ago.\nMost of the drawers are hanging open with nothing inside.\nThe door to the dining room seems to be locked from the other side.',['knife']))
    roomMap.push(new Room(4, 2, 2, 'dining room', 'You are in the dining room.\nThere is a long wooden dinner table with several empty viles atop it.\nOne empty vial for every seat at the table ...exept one.', ['vial']));

    // Create item objects with their description
    // room number, item name, item describle, takeable Y/N

    //takeable items
    items.push(new Item(1, 'note', 'some note', true));
    items.push(new Item(1, 'flashlight', 'some flashlight', true));
    items.push(new Item(1, 'book', 'some book', true));
    items.push(new Item(2, 'batteries', 'some batteries', true));
    items.push(new Item(2, 'key', 'some key', true));
    items.push(new Item(3, 'knife', 'some knife', true));
    items.push(new Item(4, 'vile', 'some vile', true));

    // untakeable items
    items.push(new Item(1, 'desk', 'a mahagony desk with a note, flashlight and book on it', false));
    items.push(new Item(1, 'bookcase', 'a towerinb bookcase', false));
    items.push(new Item(2, 'small desk', 'a small desk', false));
    items.push(new Item(2, 'portrait', 'a portrait of a beautful woman', false));
    items.push(new Item(3, 'drawer', 'cabinet drawer', false));
    items.push(new Item(4, 'table', 'an oval dining table', false));

    let player = new Player('Dakota');

    while (true) {
        let answer = await ask('>_');

        userAction = answer.toLowerCase().trim();

        // parse user input into two distinct fieds (1)action (first word) and (2)target (remaining words)
        let inputArray = userAction.split(' ')
        let action = inputArray[0]
        let target = inputArray.splice(1).join(" ")

        if (action === 'exit') {
            console.log('Thanks for playing');
            process.exit();
        } else if (action === 'north' || action === 'south' || action === 'east' || answer === 'west') {
            player.move(target);
        } else if (action === 'observe') {
            player.observe();
        }
        else if (action === 'inspect')
        {
            player.inspect(target);
        } 
        else if (action === 'take') {
            player.take(target);
        } 
        else if (action == 'inventory') {
            player.showInventory();
        } else {
            console.log('I don\'t understand that command.  Please try again.\n');
        }
    }

}