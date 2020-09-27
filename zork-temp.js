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

    isOpen() {
        return !this.locked;
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
        this.healthLevel = 100;
        this.appetite = 'full';
        this.currentRoom = house.getEntryRoom();
        this.currentColumn = 1;
        this.currentRow = 1;
    }

    isAlive() {
        return (this.healthlevel > 0 ? false : true);
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
            return false;
        }
        else {
            this.currentColumn = newColumn;
            this.currentRow = newRow;
            this.currentRoom = house.getRoom(newColumn, newRow);
            return true;
        }
    }

    // Use an item that a player has in their inventory
    use(target) {

        let item = this.getInventoryItem(target);

        if (item == null) {
            console.log('You can\'t use the ' + target + ' because you don\'t have it');
            return;
        }

        // Unlock the room if the player uses an item that is capable of doing this.
        if (item != null &&
            item.affectsRoomLock) {
            this.currentRoom.unlock();
            console.log('Congrats! you are no longer locked in the ' + this.currentRoom.name + '!');
            console.log('You can move to the next room now!\n');
        }

        // If an item will wear out over time, start a countdown until it is dead
        if (item != null &&
            item.hasFiniteLife) {
            item.useStatus = true;
            item.life -= 10;
            console.log(item.description + '\n');
        }
    }

    // Display room description of the current room
    observe() {
        console.log('---------------------------------------------------------------------------------');
        console.log(this.currentRoom.description + '\n');
    }

    // Show player's current inventory of items
    showInventory() {
        if (this.inventory.length > 0) {
            console.log('--------------------');
            for (const item of this.inventory) {
                console.log(item.name)
            }
            console.log('--------------------')
        }
        else {
            console.log('Your inventory is empty!');
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
            console.log(item.name + ' added to your inventory\n');
            playerTookItem = true;
        }
        else {
            console.log('Item cannot be taken');
        }

        // If item and was able to be takan and will affect a players health in some way
        // update the player's health accordingly.
        if (item != undefined &&
            item.affectsPlayerHealth &&
            playerTookItem) {
            this.healthLevel -= 10;
            this.applyHealthEffects(item.name);
        }
    }

    // Validate whether player has the critical items they need and notify them based on status
    hasItemsNeeded(inventory) {
        let flashlight = this.getInventoryItem('flashlight');

        if (flashlight === null ||
            flashlight.useStatus === false) {
            console.log('You trip and fall, ouch. It\'s too dark to see anything!\nWhy don\'t you take the flashlight and turn it on?');
            return false;
        }
        else if (flashlight.life === 0) {
            console.log('Your flashlight batteries have run out!\n.');
            console.log('You\'ll never find your way out now! The house has consumed you!');
            process.exit();
        }
        else {
            return true;
        }
    }
    // Apply any helpful or detrimental effects that an item may have on a player when they use it.
    applyHealthEffects(item) {
        if (item === 'knife') {
            console.log('The knife was sharp!\nYou\'ve grabbed it from the wrong end and cut yourself!');
            console.log('In shock you\'ve dropped the bloody knife onto the floor!');
            console.log('You\'ll need to find some bandages quickly!');
            this.inventory.pop();
        }
        else if (item === 'bandages' &&
            this.healthLevel < 100) {
            console.log('You patch your knife wound with the bandages and the bleeding stops.');
            console.log('Not a moment too soon!\nYou would have surely perished otherwise!');
            this.healthLevel = 100;
        }
    }

    // Assess and adjust players health and update it based on the action they are taking
    updatePlayerHealth(action) {
        // if a player is wounded or ill, decrement their health further
        if (action === 'move' &&
            this.healthLevel < 100) {
            this.healthLevel = this.healthLevel - 20;
        }
    }

    // Display player's health status 
    displayPlayerHealth() {
        if (this.healthLevel <= 0) {
            console.log('You couldn\'t escape in time!\nYou\'ve succumbed to your wounds and will lie in this house forever!');
        }
        else if (this.healthLevel > 0 &&
            this.healthLevel < 100) {
            console.log('You\'re still bleeding and getting weaker by the second! You have  ' + this.healthLevel + '% of your health left!');
            console.log('Find a way to stop the bleeding before your time runs out!');
        }
    }

    // Update the life of any useable items that have a finite life
    updateItemHealth() {
        let flashlight = this.getInventoryItem('flashlight');

        if (flashlight != null &&
            flashlight.useStatus === true &&
            flashlight.life > 0) {
            flashlight.life = flashlight.life - 10;
        }
    }

    // display the health of any finite life items
    displayItemHealth() {
        let flashlight = this.getInventoryItem('flashlight');

        if (flashlight != null &
            flashlight.life < 50) {
            console.log('Your flashlight batteries are low! ' + flashlight.life + '% power left!');
            console.log('Start looking for batteries soon or you\'ll find no escape!');
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
    console.log('During a night out at the local pub with friends, a stranger bumps into you and spills their drink, soaking your clothes.');
    console.log('Apologetically, the stranger offers to buy you a drink, which you accept.');
    console.log('The stranger hands you the drink and launches into further apologies as you drink');
    console.log('The last thing you see as you vision fades is the toothy grin of the mysterious stranger...')
    console.log('__________________________________________________________________________________')
    console.log('__________________________________________________________________________________')
    console.log('__________________________________________________________________________________')
    console.log('You\'ve awoken in a very dark room, barely able to see but from the moonlight streaking in from a window high on the wall.');
    console.log('You cannot remember how you got here, only that it must be the mysterious stranger\'s doing.');
    console.log('You see a glint of something shiny in the moonlight. What looks to be a flashlight is sitting close by.');

    // show list of available commands
    showCommands();
}

function showCommands() {
    console.log('USE THE FOLLOWING COMMANDS:\n');
    console.log('    observe            to see a description of the room you are currently in.');
    console.log('    inventory          to see a list of the items that are currently in your possession.');
    console.log('    move <direction>   to walk north, south, east, west');
    console.log('    take <item>        to pick an item in a room up.');
    console.log('    use <item>         to use or read an item that you have in your possession.');
    console.log('    help               to see this list of commands again.');
    console.log('    exit               to quit the game\n');
}

function isGameOver(player) {
    // check for win condition
    if (player.currentRoom.name === 'Master Bedroom' &&
        player.getInventoryItem('knife') !== null) {
        console.log('At the sight of the bloody knife in your hand, the seemingly vicious dog starts to whimper!\nThe cowardly dog dives under the bed, leaving your path to freedom clear!');
        console.log('You rush to the window and fling it wide open! The cold night air fills your lungs as you climb down the lattice to freedom!\nYou run as far away from that terrifying house as your legs will take you, hopeful to never return!')
        process.exit();
    }
    else if (player.isAlive) {
        return false;
    }
    else {
        process.exit();
    }
}

async function start() {

    // Display Intro Text
    showIntro();

    //Create house and rooms
    house = new House();

    // room number, column, row, room name, room description, roomLocked boolean 
    house.addRoom(new Room(1, 1, 1, 'Library', 'You are in the library.\nThis room has bookcases from floor to ceiling, except one in particular that\'s only a little taller than you are. There\'s a single small desk in the center of the room.', true))
    house.addRoom(new Room(2, 1, 2, 'Closet', 'You are in a storage closet.\nThe closet is full of cleaning supplies, some old rags, a case of beer, a box of cigarettes, a box of batteries and a few other things.', false))
    house.addRoom(new Room(3, 2, 1, 'Kitchen', 'You are in the kitchen.\nThe kitchen looks to have been ransacked some time ago.\nMost of the drawers are hanging open with nothing inside.\nThe door to the dining room seems to be locked from the other side.', true))
    house.addRoom(new Room(4, 2, 2, 'Dining room', 'You are in the dining room.\nThere is a long wooden dinner table with several empty viles atop it.\nOne empty vial for every seat at the table ...exept one.', false))
    house.addRoom(new Room(5, 2, 3, 'Study', 'You are in the study.\nThere is a large oak desk in the room with faded portraits hanging on the wall,\none seems to be askew...', true))
    house.addRoom(new Room(6, 1, 3, 'Bathroom', 'You are in a large, luxurious bathroom.\nThere is a large ornate mirror above the sink.\n', false))
    house.addRoom(new Room(7, 1, 4, 'Master Bedroom', 'You are in the master bedroom.\nThe windows on the far wall are large enought to climb through.\n But wait suddenly a large vicious dog appears to block your way.', false))

    // Create items that exist in rooms in house
    itemCollection = new ItemCollection();

    // first create takeable items
    // room number, item name, item description, takeable boolean, hasFiniteLife boolean, affectsRoomLock boolean, affectsHealthBoolean, life
    itemCollection.addItem(new Item(1, 'note', 'Welcome you to my home stranger.\nLet\'s see if you can find your way out!,', true, false, false, false));
    itemCollection.addItem(new Item(1, 'flashlight', 'Your flashlight is on!\nYou can now see a note on the table and a book that\'s fallen on the floor.', true, true, false, false, 100));
    itemCollection.addItem(new Item(1, 'book', 'Reading the book was magical.  The lock on the door to the next room is now open', true, false, true, false));
    itemCollection.addItem(new Item(2, 'batteries', 'The batteries did the trick, your flashlight works again', true, false, false, false));
    itemCollection.addItem(new Item(3, 'screwdriver', 'congrats, you have unlocked the door to the dining room', true, false, true, false));
    itemCollection.addItem(new Item(3, 'cookies', 'yummy cookies', true, false, false, true));
    itemCollection.addItem(new Item(3, 'knife', 'a sharp ginsu knife', true, false, false, true));
    itemCollection.addItem(new Item(4, 'vial', 'a vial full of a red liquid', true, false, false, true));
    itemCollection.addItem(new Item(5, 'key', 'a silver key', true, false, true, false));
    itemCollection.addItem(new Item(6, 'bandages', 'a box of gauss and bandages', true, false, false, true));

    // create untakeable items
    itemCollection.addItem(new Item(1, 'desk', 'A small desk next to a chair meant for reading. There\'s a book atop it with what looks to be a hand written note underneath.', false, false, false, false));
    itemCollection.addItem(new Item(1, 'bookcase', 'A rather small bookcase filled with books. It looks like a book is missing from the Encyclopedia section.', false, false, false, false));
    itemCollection.addItem(new Item(2, 'lage desk', 'A large mahogany desk with several drawers.', false, false, false, false));
    itemCollection.addItem(new Item(2, 'portrait', 'An oil painting of a beautiful woman. It looks crooked.', false, false, false, false));
    itemCollection.addItem(new Item(3, 'drawer', 'cabinet drawer', false, false, false, false));
    itemCollection.addItem(new Item(4, 'table', 'an oval dining table', false, false, false, false));

    // Create player and display initial room description
    let player = new Player();
    player.observe();

    // Loop and accept commands from player
    while (!isGameOver(player)) {

        //  get and parse user input into two distinct fieds (1)action (first word) and (2)target (remaining words)
        let answer = await ask(player.currentRoom.name.toUpperCase() + '>_');
        userAction = answer.toLowerCase().trim();
        let inputArray = userAction.split(' ');
        let action = inputArray[0];
        let target = inputArray.splice(1).join(" ");


        //  take action based on player's input
        if (action === 'exit') {
            console.log('Thanks for playing! It\'s a shame you couldn\'t find your way out!');
            process.exit();
        }
        else if (action === 'move') {

            if (player.hasItemsNeeded() &&
                player.currentRoom.isOpen()) {

                // try to move
                let playerAbleToMove = player.move(target);

                // if able to move, display description of new room 
                // and update/display player and item health
                if (playerAbleToMove) {
                    player.observe();
                    player.updatePlayerHealth(action);
                    player.displayPlayerHealth();
                    player.updateItemHealth();
                    player.displayItemHealth();
                }
            }
            else {
                console.log('Sorry, you don\'t have the items you need to get out of this room yet.');
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
    }
}

// Mainline
start();
