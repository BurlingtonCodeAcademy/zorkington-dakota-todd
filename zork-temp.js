class House {
    constructor() {
        this.roomCollection = [];
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

    // get an item in a room
    getItem(itemWanted) {
        const index = this.items.findIndex(item => item.name === itemWanted);
        return this.items[index];
    }
}

class Item {
    constructor(roomNumber, name, desc, takeable, hasFiniteLife, affectsRoomLock, affectsPlayerHealth, life) {
        this.roomNumber = roomNumber;
        this.name = name;
        this.description = desc;
        this.takeable = takeable;
        this.hasFiniteLife = hasFiniteLife;
        this.useStatus = false;
        this.affectsRoomLock = affectsRoomLock;
        this.affectsPlayerHealth = affectsPlayerHealth;
        this.life = life;
    }
}

class Player {

    constructor(name) {
        this.name = name;
        this.inventory = [];
        this.healthStatus = 100;
        this.appetite = 'full';
        this.currentRoom = house.getEntryRoom();
        this.currentColumn = 1;
        this.currentRow = 1;
    }

    getInventoryItem(name) {

        let returnItem = null;
        this.inventory.forEach((item) => {
            if (item.name === name) {
                returnItem = item;
            }
        })
        return returnItem;
    }

    // Move from room to room
    // Rooms are positioned in a matrix like fashion.
    // Row and Column identify each rooms location relative to other rooms
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

        // Only allow player to move if there move keeps them in the house
        if (house.getRoom(newColumn, newRow) === null) {
            console.log("you can\'t go in that directon");
        }
        else {
            this.currentColumn = newColumn;
            this.currentRow = newRow;
            this.currentRoom = house.getRoom(newColumn, newRow);
        }
    }

    // Use an item that a player has in their inventory
    use(target) {

        let item = this.getInventoryItem(target);

        if (item == null) {
            console.log('You can\'t use the ' + target + ' because you don\'t have it');
            return;
        }

        // Unlock the room if the player uses certain items
        if (item != null &&
            item.affectsRoomLock) {
            this.currentRoom.unlock();
            console.log('Congrats, you have unlocked the door to the ' + this.currentRoom.name);
            console.log('You can move to other rooms now!');
        }

        // If an item will wear out over time, start a countdown until it is dead
        if (item != null &&
            item.hasFiniteLife) {
            item.useStatus = true;
            item.life -= 10;
            console.log(item.description);
        }
    }

    // Display room description of the current room
    observe() {
        console.log('\n' + this.currentRoom.description + '\n');
    }

    // Show player's current inventory of items
    showInventory() {

        if (this.inventory.length > 0) {
            console.log('\n');
            console.log('--------------------');
            for (const item of this.inventory) {
                console.log(item.name)
            }
            console.log('--------------------')
        }
        else {
            console.log('Your backpack is empty!');
        }
    }

    // Take item from a room & add to a players inventory
    take(itemWanted) {

        let item = itemCollection.getItem(itemWanted);

        let playerTookItem = false;

        // If item is takeable and is in the room that the player is in
        // and player doesn't already have item, add it to their inventory
        if (item != undefined &&
            item.takeable &&
            item.roomNumber === this.currentRoom.roomNumber &&
            this.getInventoryItem(itemWanted) === null) {
            this.inventory.push(item);
            console.log(item.name + ' added to your backpack\n');
            playerTookItem = true;
        }
        else {
            console.log('Item cannot be taken');
        }

        // If item will affect players health, decrement the health status
        if (item != undefined &&
            item.affectsPlayerHealth &&
            playerTookItem) {
            this.healthStatus -= 10;
            this.applyHealthEffects(item.name);
        }
    }

    applyHealthEffects(item) {
        if (item === 'knife') {
            console.log('The knife blade was pointed up and you accidently stabbed your hand.  The knife falls to the floor.');
            console.log('You have a deep wound that is bleeding badly.  You need bandages quick!');
            this.inventory.pop();
        }
        else if (item === 'bandages' &&
            this.healthStatus < 100) {
            console.log('You patch the  wound with the bandages and the bleeding stops.');
            console.log('It\'s a good thing because otherwise you were a gonner!');
            this.healthStatus = 100;
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
    console.log('Unfortunately for you, epic got you into trouble!');
    console.log('You\'ve awoken in a dark, unfamiliar house with no memory of how you ended up there.');
    console.log('The house looks like it\'s been abandoned for quite some time.\n');
    console.log('You must navigate through the house to find your escape.');
    console.log('BEWARE as there are many perils and surprises that await you!');

    // show list of available commands
    showCommands();
}

function showCommands() {
    console.log('You can use the following commands to help you find your way out:\n');
    console.log('    observe            to see a description of the room you are currently in.');
    console.log('    inventory          to see a list of the items that are currently in your possession.');
    console.log('    move <direction>   to walk north, south, east, west');
    console.log('    take <item>        to pick an item in a room up.');
    console.log('    use <item>         to use or read an item that you have in your possession.');
    console.log('    help               to see this list of commands again.');
    console.log('    exit               to quit the game\n');
}

async function start() {

    // Show the Intro Text
    showIntro();

    //Create house and rooms
    house = new House();

    // room number, column, row, room name, room description, roomLocked boolean 
    house.addRoom(new Room(1, 1, 1, 'library', 'You are in the library.\nThis room has bookcases from floor to ceiling, except one in particular that\'s only a little taller than you are. There\'s a single small desk in the center of the room.', true))
    house.addRoom(new Room(2, 1, 2, 'Closet', 'You are in a storage closet.\nThe closet is full of cleaning supplies, some old rags, a case of beer, a box of cigarettes, a box of batteries and a few other things.', false))
    house.addRoom(new Room(3, 2, 1, 'kitchen', 'You are in the kitchen.\nThe kitchen looks to have been ransacked some time ago.\nMost of the drawers are hanging open with nothing inside.\nThe door to the dining room seems to be locked from the other side.', true))
    house.addRoom(new Room(4, 2, 2, 'dining room', 'You are in the dining room.\nThere is a long wooden dinner table with several empty viles atop it.\nOne empty vial for every seat at the table ...exept one.', false))
    house.addRoom(new Room(5, 2, 3, 'study', 'You are in the study.\nThere is a large oak desk in the room with faded portraits hanging on the wall,\none seems to be askew...', true))
    house.addRoom(new Room(6, 1, 3, 'bathroom', 'You are in a large, luxurious bathroom.\nThere is a large ornate mirror above the sink.\n', false))
    house.addRoom(new Room(7, 1, 4, 'master bedroom', 'You are in the master bedroom.\nThe windows on the far wall are large enought to climb through.\n But wait suddenly a large vicious dog appears to block your way.', false))

    // Create items that exist in rooms in house
    itemCollection = new ItemCollection();

    //takeable items
    // room number, item name, item description, takeable boolean, hasFiniteLife boolean, affectsRoomLock boolean, affectsHealthBoolean, life
    itemCollection.addItem(new Item(1, 'note', 'Finding your way out a library can be challenging.  The key is to make sure everything is in its proper place.', true, false, false, false));
    itemCollection.addItem(new Item(1, 'flashlight', 'Your flashlight is on!\nYou can now see a note on the table and a small book on the floor.', true, true, false, false, 100));
    itemCollection.addItem(new Item(1, 'book', 'Reading the book was magical.  The lock on the door to the next room is now open', true, false, true, false));
    itemCollection.addItem(new Item(2, 'batteries', 'The batteries did the trick, your flashlight works again', true, false, false, false));
    itemCollection.addItem(new Item(3, 'screwdriver', 'congrats, you have unlocked the door to the dining room', true, false, true, false));
    itemCollection.addItem(new Item(3, 'cookies', 'yummy cookies', true, false, false, true));
    itemCollection.addItem(new Item(3, 'knife', 'a sharp ginsu knife', true, false, false, true));
    itemCollection.addItem(new Item(4, 'vial', 'a vial full of a red liquid', true, false, false, true));
    itemCollection.addItem(new Item(5, 'key', 'a silver key', true, false, true, false));
    itemCollection.addItem(new Item(6, 'bandages', 'a box of gauss and bandages', true, false, false, true));
   

    // untakeable items
    itemCollection.addItem(new Item(1, 'desk', 'a mahagony desk with a note, flashlight and book on it', false, false, false, false));
    itemCollection.addItem(new Item(1, 'bookcase', 'a towering bookcase', false, false, false, false));
    itemCollection.addItem(new Item(2, 'small desk', 'a small desk', false, false, false, false));
    itemCollection.addItem(new Item(2, 'portrait', 'a portrait of a beautful woman', false, false, false, false));
    itemCollection.addItem(new Item(3, 'drawer', 'cabinet drawer', false, false, false, false));
    itemCollection.addItem(new Item(4, 'table', 'an oval dining table', false, false, false, false));

    // Create player and display initial room description
    let player = new Player();
    player.observe();

    // Loop and accept commands from player
    while (true) {

        //  get and parse user input into two distinct fieds (1)action (first word) and (2)target (remaining words)
        let answer = await ask(player.currentRoom.name.toUpperCase() + '>_');
        userAction = answer.toLowerCase().trim();
        let inputArray = userAction.split(' ')
        let action = inputArray[0]
        let target = inputArray.splice(1).join(" ")
        let flashlight = player.getInventoryItem('flashlight');

        //  take action based on player's input
        if (action === 'exit') {
            console.log('Thanks for playing');
            process.exit();
        }
        else if (action === 'move') {

            if (flashlight === null ||
                flashlight.useStatus === false) {
                console.log('You trip and fall, ouch.  Why don\'t you take the flashlight and turn it on?');
            }
            else if (flashlight.life === 0) {
                console.log('Your flashlight batteries have run out.  You trip and land on a glass table.');
                console.log('The table shatters and unfortunately you won\'t be down for breakfast!');
                process.exit();
            }
            else if (player.currentRoom.isLocked() === false) {

                // if player is wounded and they try to move, decrement their health further
                if (player.healthStatus < 100) {
                    player.healthStatus = player.healthStatus - 20;
                }

                if (player.healthStatus <= 0) {
                    console.log('Sorry, unfortunately you have met your demise and died!');
                    process.exit();
                }
                else if (player.healthStatus > 0 &&
                    player.healthStatus < 100) {
                    console.log('Your still bleeding and getting weaker.  You have  ' + player.healthStatus + '% of your energy left!');
                    console.log('Find a way to patch that wound or your a goner!');
                }

                player.move(target)
                player.observe();

                if (flashlight != null &&
                    flashlight.useStatus === true &&
                    flashlight.life > 0) {
                    flashlight.life = flashlight.life - 10;
                }

                if (flashlight != null &
                    flashlight.life < 50) {
                    console.log('Your flashlight batteries only have ' + flashlight.life + '% of life left');
                    console.log('Start looking for batteries soon or you\'ll be in the dark');
                }
            }
            else {
                console.log('Sorry, you don\'t have the items you need to move from this room yet');
            }
        }
        else if (action === 'observe') {
            player.observe();
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

        // check for win condition
        if (player.currentRoom.name === 'master bedroom' &&
            player.getInventoryItem('knife') !== null) {
            console.log('You win!');
            process.exit();
        }
    }
}

// Mainline
start();
