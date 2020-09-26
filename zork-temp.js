class House {
    constructor() {
        this.roomCollection = [];
        this.northEdge = 0;
        this.southEdge = 0;
        this.eastEdge = 0;
        this.westEdge = 0;
    }

    addRoom(room) {
        this.roomCollection.push(room);
    }

    // helper function to get room based on column and row
    getRoom(col, row) {
        let currRoom = null;

        this.roomCollection.forEach((room) => {
            if (col === room.column &&
                row === room.row) {
                currRoom = room;        
            }
        })
        return currRoom;
    }

    getEntryRoom() {
        return this.roomCollection[0];
    }
}

class Room {
    constructor(roomNumber, column, row, name, description, locked) {
        this.roomNumber = roomNumber;
        this.column = column;
        this.row = row;
        this.name = name;
        this.description = description;
        this.locked = locked;
    }

    unlock() {
        this.locked = false;
    }

    isLocked() {
        return this.locked;
    }

}

class ItemCollection {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    getItemCollection() {
        return this.items;
    }
}

class Item {
    constructor(roomNumber, name, desc, takeable) {
        this.roomNumber = roomNumber;
        this.name = name;
        this.description = desc;
        this.takeable = takeable;
        this.itemStatus = 'in room'
        this.useStatus = null;
    }

    markItemTaken() {
        this.itemStatus = 'taken';
    }
}

class Player {

    constructor(name) {
        this.name = name;
        this.inventory = [];
        this.status = ['healthy', 'full'];
        this.currentRoom = house.getEntryRoom();
        this.currentColumn = 1;
        this.currentRow = 1;
    }

    // get number of takeable items that a player has in their inventory from a particlar room
    countRoomItems(roomNumber) {
        let roomItemCount = 0;

        for (const item of this.inventory) {
            if (item.roomNumber === roomNumber) {
                roomItemCount += 1;

            }
        }
        return roomItemCount;
    }

    hasRequiredItems() {
        return true;
    }

    // Move from room to room
    move(direction) {

        let newColumn = this.currentColumn;
        let newRow = this.currentRow;

        switch (direction) {
            case 'north':
                newRow = this.currentRow - 1;
                break;
            case 'south':
                newRow = this.currentRow + 1; 
                break;
            case 'east':
                newColumn = this.currentColumn + 1;
                break;
            case 'west':
                newColumn = this.currentColumn - 1;
                break;
            default:
                console.log('Direction must be north, south, east, or west.')
                break;
        }

        if (house.getRoom(newColumn, newRow) === null) {
            console.log("you can\'t go in that directon");
        }
        else {
            this.currentColumn = newColumn;
            this.currentRow = newRow;
            this.currentRoom = house.getRoom(newColumn, newRow);
        }
    }

    inspect(target) {
        for (const item of this.inventory) {
            if (target === item.name) {
                console.log(item.description);
            }
        }
    }

    use(target) {
        if (target.name === 'flashlight') {
            target.useStatus = 'on';
            console.log('Your flashlight is on!');
        }
        else {
            target.useStatus = 'off';
            console.log('You need to turn your flashlight on to see where you are going');
        }
    }

    // Display room description
    observe() {
        console.log(this.currentRoom.description + '\n');
    }

    // Show current inventory items
    showInventory() {
        for (const item of this.inventory)
            console.log(item.name)
    }

    // Take item from room & add to inventory
    take(itemWanted) {
        let index = 0;
        let  itemCannotBeTaken = true;

        for (const item of itemCollection.getItemCollection()) {
            index += 1;
           
            // Only allow a player to take an item if it is in room they are in
            // and only allow player to take an item from a room once.

            if (item.name === itemWanted &&
                this.currentRoom.roomNumber === item.roomNumber &&
                item.itemStatus === 'in room' &&
                item.takeable === true) {
                this.inventory.push(item);
                item.markItemTaken();
                console.log(itemWanted + ' added item to inventory');
                itemCannotBeTaken = false;
                break;
            }
            else {
                itemCannotBeTaken = true;
            }
        }
   
        if (itemCannotBeTaken) {
            console.log('You cannot take ' + itemWanted);
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

function showIntro() {
    console.log('__________________________________________________________________________________')
    console.log('Last night was an epic night out with your friends exploring the Burlington scene.');
    console.log('Unfortunately for you, in this case, epic got you into trouble!');
    console.log('You\'ve awoken in a dark, unfamiliar house with no memory of how you ended up there.');
    console.log('The house looks like it\'s been abandoned for quite some time.\n');
    console.log('You must navigate through the house to find your escape.');
    console.log('BEWARE as there are many perils and surprises that await you!');

    // show list of available commands
    showCommands();
}

function showCommands() {
    console.log('You can use the following commands to help you find your way out:\n');
    console.log('    move north:  walk north in a room.');
    console.log('    move south:  walk south in a room.');
    console.log('    move east:   walk east in a room.');
    console.log('    move west:   walk west in a room.');
    console.log('    observe:     see a description of the room you are currently in.');
    console.log('    inventory:   see a list of the items that are currently in your possession.');
    console.log('    take:        pick an item in a room up.');
    console.log('    inspect:     read or look close at an item that you have.');
    console.log('    use:         use an item that you have in your possession.');
    console.log('    help:        see this list of commands again.');
    console.log('    exit:        quit the game\n');
}

async function start() {

    // Show the Intro Text
    showIntro();

    //Create house and rooms

    house = new House();

    // room number, column, row, room name, room description, locked boolean 
    house.addRoom(new Room(1, 1, 1, 'library', 'You are in the library.\nThis room has bookcases from floor to ceiling, except one in particular that\'s only a little taller than you are. There\'s a single small desk in the center of the room.', true))
    house.addRoom(new Room(2, 2, 1, 'kitchen', 'You are in the kitchen.\nThe kitchen looks to have been ransacked some time ago.\nMost of the drawers are hanging open with nothing inside.\nThe door to the dining room seems to be locked from the other side.', true))
    house.addRoom(new Room(3, 2, 2, 'dining room', 'You are in the dining room.\nThere is a long wooden dinner table with several empty viles atop it.\nOne empty vial for every seat at the table ...exept one.', true))
    house.addRoom(new Room(4, 2, 3, 'study', 'You are in the study.\nThere is a large oak desk in the room with faded portraits hanging on the wall,\none seems to be askew...', true))

    // Create items that exist in rooms in house
    itemCollection = new ItemCollection();

    //takeable items
    // room number, item name, item description, takeable boolean
    itemCollection.addItem(new Item(1, 'note', 'Finding your way out a library can be challenging.  The key is to make sure everything is in its proper place.', true));
    itemCollection.addItem(new Item(1, 'flashlight', 'some flashlight', true));
    itemCollection.addItem(new Item(1, 'book', 'a small book that could be placed on the bookcase', true));
    itemCollection.addItem(new Item(2, 'batteries', 'some batteries', true));
    itemCollection.addItem(new Item(2, 'key', 'some key', true));
    itemCollection.addItem(new Item(3, 'knife', 'some knife', true));
    itemCollection.addItem(new Item(4, 'vile', 'some vile', true));

    // untakeable items
    itemCollection.addItem(new Item(1, 'desk', 'a mahagony desk with a note, flashlight and book on it', false));
    itemCollection.addItem(new Item(1, 'bookcase', 'a towering bookcase', false));
    itemCollection.addItem(new Item(2, 'small desk', 'a small desk', false));
    itemCollection.addItem(new Item(2, 'portrait', 'a portrait of a beautful woman', false));
    itemCollection.addItem(new Item(3, 'drawer', 'cabinet drawer', false));
    itemCollection.addItem(new Item(4, 'table', 'an oval dining table', false));

    let player = new Player();
    player.observe();

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
        }
        else if (action === 'move') {

            if (player.hasRequiredItems()) {
                player.move(target)
                player.observe();
            }
            else {
                console.log('Sorry, you don\'t have the items you need to move from this room yet');
            }
        }
        else if (action === 'observe') {
            player.observe();
        }
        else if (action === 'inspect') {
            player.inspect(target);
        }
        else if (action === 'use') {
            player.use(target);
        }
        else if (action === 'take') {
            player.take(target);
        }
        else if (action === 'inventory') {
            player.showInventory();
        }
        else if (action === 'help') {
            showCommands();
        }
        else {
            console.log('I don\'t understand that command.  Please try again.\n');
        }
    }
}

// Mainline
start();
