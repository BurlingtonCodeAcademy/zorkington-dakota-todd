// Objects and functions associated with game
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

    isAdjacentRoom(currentRoom, newRoom) {

        console.log('isAdjacent: ' + currentRoom.adjacentRooms);
        if (currentRoom.adjacentRooms.includes(newRoom)) {
            console.log('returning true')
            return true;
        }
        else {
            console.log('returning false')
            return false;
        }
    }
}

class Room {
    constructor(roomNumber, column, row, name, adjacentRooms, description, takeableItemDesc, locked, imageName) {
        this.roomNumber = roomNumber;
        this.column = column;
        this.row = row;
        this.name = name;
        this.adjacentRooms = adjacentRooms;
        this.description = description;
        this.takeableItemDescription = takeableItemDesc;
        this.fullDescription = description + takeableItemDesc;
        this.locked = locked;
        this.imageName = './images/' + imageName;
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

    // Add an item into array to store defined items
    addItem(item) {
        this.items.push(item);
    }

    // find an item in a room and return it
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
        this.isBandaged = false;
        this.currentRoom = house.getEntryRoom();
        this.currentColumn = 1;
        this.currentRow = 1;
    }

    isAlive() {
        return (this.healthlevel > 0 ? false : true);
    }

    // Search for item in player inventory and return it
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
                statusArea.innerText = 'Direction must be north, south, east, or west.';
                break;
        }

        console.log('new room is: ' + house.getRoom(newColumn, newRow).name);
        // Only allow player to move to an adjacent room.
        if ((house.getRoom(newColumn, newRow) === null) ||
            (house.isAdjacentRoom(this.currentRoom, house.getRoom(newColumn, newRow).name) === false)) {
            statusArea.innerText = "you can\'t go in that directon";
            return false;
        }
        else {
            this.currentColumn = newColumn;
            this.currentRow = newRow;
            this.currentRoom = house.getRoom(newColumn, newRow);
            statusArea.innerText = '';

            if (this.currentRoom.image != '') {
                document.getElementById('room-image').src = this.currentRoom.imageName;
            }

            return true;
        }
    }

    // Use an item that a player has in their inventory
    use(target) {

        let item = this.getInventoryItem(target);

        if (item === null) {
            statusArea.innerText = 'You can\'t use the ' + target + ' because you don\'t have it';
            return;
        }
        else {
            statusArea = document.getElementById('statusArea');
            statusArea.innerText = item.description;
        }

        // Unlock the room if the player uses an item that is capable of doing this.
        if (item != null &&
            item.affectsRoomLock) {
            this.currentRoom.unlock();
        }

        // If an item will wear out over time, start a countdown until it is dead
        if (item != null &&
            item.hasFiniteLife) {
            item.useStatus = true;
            item.life -= 10;
        }

        // Don't remove flashlight from inventory, once player has it, they always keep these items.
        if (item.name != null &&
            (item.name != 'flashlight' &&
                item.name != 'batteries' &&
                item.name != 'bandages')) {
            this.removeInventoryItem(item);
        }

        // Apply health effects when item is used
        this.applyHealthEffects(item.name);
    }

    // remove an item from a player's inventory
    removeInventoryItem(itemWanted) {
        const index = this.inventory.indexOf(itemWanted);

        if (index > -1) {
            this.inventory.splice(index, 1);
        }
    }

    // Display room description of the current room
    observe() {
        gameInfoArea = document.getElementById('game-info-area');
        gameInfoArea.innerText = this.currentRoom.fullDescription;
    }

    // Show player's current inventory of items
    showInventory() {

        statusArea.innerText = ''
        if (this.inventory.length > 0) {
            for (const item of this.inventory) {
                statusArea.innerText += item.name + '\n '
            }
        }
        else {
            statusArea.innerText = 'Your inventory is empty!';
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
            statusArea.innerText = item.name + ' added to your inventory';
            this.currentRoom.fullDescription = this.currentRoom.description;
            playerTookItem = true;
        }
        else {
            statusArea.InnerText = 'Item cannot be taken';
        }

        // If item and was able to be taken and will affect a players health in some way
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
            statusArea.innerText = 'You trip and fall, ouch. It\'s too dark to see anything! Why don\'t you take the flashlight and turn it on?';
            return false;
        }
        else if (flashlight.life === 0) {
            statusArea.innerText = 'Your flashlight batteries have run out!' +
                'You\'ll never find your way out now! The house has consumed you!';
            process.exit();
        }
        else {
            return true;
        }
    }

    // Apply any helpful or detrimental effects that an item may have on a player when they use it.
    applyHealthEffects(item) {
        if (item === 'knife' &&
            this.isBandaged === false) {
            statusArea.innerText = 'The knife was sharp! You\'ve grabbed it from the wrong end and cut yourself! In shock you\'ve dropped the bloody knife onto the floor! You\'ll need to find some bandages quickly!';
            this.inventory.pop();
        }
        else if (item === 'bandages' &&
            this.healthLevel < 100) {
            statusArea.innerText = 'You patch your knife wound with the bandages and the bleeding stops.' +
                'Not a moment too soon!\nYou would have surely perished otherwise!';
            this.healthLevel = 100;
            this.isBandaged = true;
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
            statusArea.innerText = 'You couldn\'t escape in time!\nYou\'ve succumbed to your wounds and will lie in this house forever!';
        }
        else if (this.healthLevel > 0 &&
            this.healthLevel < 100 &&
            this.isBandaged === false) {
            statusArea.innerText = 'You\'re still bleeding and getting weaker by the second! You have  ' +
                this.healthLevel + '% of your health left!' +
                'Find a way to stop the bleeding before your time runs out!';
        }
    }

    // Update the life of any useable items that have a finite life
    updateItemHealth() {
        let flashlight = this.getInventoryItem('flashlight');
        let batteries = this.getInventoryItem('batteries');

        // Reduce the flashlight life if player doesn't have batteries
        if (flashlight != null &&
            batteries === null &&
            flashlight.useStatus === true &&
            flashlight.life > 0) {
            flashlight.life = flashlight.life - 10;
            flashlight.timerRunning = true;
        }

        // Restore the flashlight if the player has batteries
        if (batteries != null &&
            flashlight != null &&
            flashlight.useStatus === true) {
            flashlight.life = 100;
        }
    }

    // display the health of any finite life items
    displayItemHealth() {
        let flashlight = this.getInventoryItem('flashlight');

        if (flashlight != null &&
            flashlight.life < 50) {
            statusArea.innerText = 'Your flashlight batteries are low! ' + flashlight.life + '% power left!\n' +
                'Start looking for batteries soon or you\'ll find no escape!';
        }
    }

}

function showIntro() {

    let introDesc =
        'During a night out at the local pub with friends, a stranger bumps into you and spills their drink, soaking your clothes.' +
        'Apologetically, the stranger offers to buy you a drink, which you accept.' +
        'The stranger hands you the drink and launches into further apologies as you drink]' +
        'The last thing you see as you vision fades is the toothy grin of the mysterious stranger...<br><br>' +
        'You\'ve awoken in a very dark room, barely able to see but from the moonlight streaking in from a window high on the wall.' +
        'You cannot remember how you got here, only that it must be the mysterious stranger\'s doing.' +
        'You see a glint of something shiny in the moonlight. What looks to be a flashlight is sitting close by.';


    gameInfoArea.innerHTML = introDesc;
    // show list of available commands
    showCommands();
}

function showCommands() {
    /*helpArea.innerHTML =
        'observe: to see a description of the room you are currently in.<br>' +
        'inventory: to see a list of the items that are currently in your possession.<br>' +
        'move <direction>: to walk north, south, east, west<br>' +
        'take <item>:  to pick an item in a room up.<br>' +
        'use <item>:  to use or read an item that you have in your possession.<br>' +
        'help:  to see this list of commands again.<br>' +
        'exit:  to quit the game<br>' +
        '' */
}

function isGameOver(player) {
    // check for win condition
    if (player.currentRoom.name === 'Master Bedroom' &&
        player.getInventoryItem('knife') !== null) {
        statusArea.innerHTML = 'At the sight of the bloody knife in your hand, the seemingly vicious dog starts to whimper!  The cowardly dog dives under the bed, leaving your path to freedom clear! ' +
            'You rush to the window and fling it wide open! The cold night air fills your lungs as you climb down the lattice to freedom! You run as far away from that terrifying house as your legs will take you, hopeful to never return!';
        process.exit();
    }
    else if (player.isAlive) {
        return false;
    }
    else {
        process.exit();
    }
}

function setupGame() {
    // Display Intro Text
    showIntro();

    //Create house and rooms
    house = new House();

    // room number, column, row, room name, adjacent rooms, room description, roomLocked boolean
    house.addRoom(new Room(1, 1, 1, 'Library', ['Kitchen'], 'You are in the library.  Every wall in this room is lined from floor to ceiling with books, but one bookcase along the eastern wall appears much shorter than the rest.', '', true, 'library.jpg'))
    house.addRoom(new Room(2, 1, 2, 'Closet', ['Bathroom'], 'You\'ve moved north into the bathroom closet.  The closet is full of useless cleaning supplies and stacks of towels.', 'Nestled amongst the cleaning supplies, you find a box of batteries!', false, 'bathcloset.jpg'))
    house.addRoom(new Room(3, 2, 1, 'Kitchen', ['Dining Room', 'Library'], 'You are in the kitchen. The room appears to have been completely ransacked some time ago. All of the cabinets and drawers are hanging open. The only way out appears to be a set of large doors on the southern side of the room.  The doors are locked from the other side.', 'You see a few glints of silver in the light of your flashlight. A knife lay in one of the drawers, while a screwdriver can be seen lying on the floor in the corner.', true, 'kitchen.jpg'))
    house.addRoom(new Room(4, 2, 2, 'Dining Room', ['Study', 'Closet'], 'You are in the dining room. A long wooden table sits in the center of the room. There are no place settings at the table except for one.  Someone must have been expecting company...  You see nothing helpful to grab in this room.  The southern end of the dining room opens to another room.', '', false, 'diningroom.jpg'))
    house.addRoom(new Room(5, 2, 3, 'Study', ['Master Bedroom', 'Bathroom'], 'You are in the study. There is a large oak desk in the room with several drawers. Mostly faded portraits can be seen on every wall except for the western side of the room.', 'One of the portraits is haning askew, sitting on the floor below it is a small brass key.', true, 'study.jpg'))
    house.addRoom(new Room(6, 1, 3, 'Bathroom', ['Master Bedroom', 'Closet'], 'You are in the bathroom. There\'s a large, rusted tub in the northern half of the room with a closet door next to it. The door to the next room lies to the south.  The mirror above the sink has been shattered to reveal a hidden medicine cabinet.', 'You can just see some bandages laying inside.', false, 'bathroom.jpg'))
    house.addRoom(new Room(7, 1, 4, 'Master Bedroom'['Study', 'Bathroom'], 'You\'ve moved south into the master bedroom. There is a very large four poster bed dominating most of the room. Several enormous windows line the far wall, big enough to climb out of!  But before you can make your way over to them, a humungous creature steps out of the darkness!  The largest, most vicious dog you\'ve ever seen is standing between you and the escape!', '', false, 'bedroom.jpg'))

    // Create items that exist in rooms in house
    itemCollection = new ItemCollection();

    // first create takeable items
    // room number, item name, item description, takeable boolean, hasFiniteLife boolean, affectsRoomLock boolean, affectsHealthBoolean, life
    itemCollection.addItem(new Item(1, 'note', 'Welcome you to my home stranger.  Let\'s see if you can find your way out!,', true, false, false, false));
    itemCollection.addItem(new Item(1, 'flashlight', 'Your flashlight is on!  You can now see a small table next to a comfortable looking chair meant for reading. On the table is a book with a faded "X" on the spine, underneath it looks to be a handwritten note.', true, true, false, false, 100));
    itemCollection.addItem(new Item(1, 'book', 'You slide the book onto the shelf in the empty space between the "W" & "Y" encyclopedia books.  You hear the click of a lock being undone. The bookcase creaks open!  You are now able to move East to the next room!', true, false, true, false));
    itemCollection.addItem(new Item(2, 'batteries', 'You put the fresh batteries in your flashlight.  Your flashlight is at full power!', true, false, false, false));
    itemCollection.addItem(new Item(3, 'screwdriver', 'You slide the narrow end of the screwdriver between the dining room doors and slide it up. The latch on the other side lifts!  You\'ve unlocked the door and can now move south into the dining room!', true, false, true, false));
    itemCollection.addItem(new Item(3, 'knife', '', true, false, false, true));
    itemCollection.addItem(new Item(5, 'key', 'The key fits perfectly into the drawers in the desk!  You open each drawer to find them all empty....except for one. There\'s a small button hidden deep inside the drawer.  You press the button and a section of the western wall slides back to reveal a hidden entry into a bathroom!', true, false, true, false));
    itemCollection.addItem(new Item(6, 'bandages', 'You use the bandages to wrap the cut on your hand.  The bleeding stops! You may just survive this house!', true, false, false, false));

    // create untakeable items
    itemCollection.addItem(new Item(1, 'desk', '', false, false, false, false));
    itemCollection.addItem(new Item(1, 'bookcase', '', false, false, false, false));
    itemCollection.addItem(new Item(5, 'lage desk', '', false, false, false, false));
    itemCollection.addItem(new Item(5, 'portrait', '', false, false, false, false));
    itemCollection.addItem(new Item(3, 'drawer', '', false, false, false, false));
    itemCollection.addItem(new Item(4, 'table', '', false, false, false, false));

    // Create player 
    player = new Player();
}

function executeCommand() {

    command = document.getElementById('action').value;
    document.getElementById('action').value = '';

    //  get and parse user input into two distinct fieds (1)action (first word) and (2)target (remaining words)
    //   let answer = await ask(player.currentRoom.name.toUpperCase() + '>_\n' +
    userAction = command.toLowerCase().trim();
    let inputArray = userAction.split(' ');
    let action = inputArray[0];
    let target = inputArray.splice(1).join(" ");

    //  take action based on player's input
    if (action === 'exit') {
        statusArea.InnerText = 'Thanks for playing! It\'s a shame you couldn\'t find your way out!';
    }
    else if (action === 'move') {

        console.log('items needed? ' + player.hasItemsNeeded())
        console.log('isOpen: ' + player.currentRoom.isOpen())

        if (player.hasItemsNeeded() &&
            player.currentRoom.isOpen()) {

            // move and update Player health
            player.move(target);
            player.updatePlayerHealth(action);

            // if able to move, display room description, player/item health
            if (player.isAlive()) {
                player.observe();
                player.displayPlayerHealth();
                player.updateItemHealth();
                player.displayItemHealth();
            }
        }
        else {
            statusArea.innerHTML = 'Sorry, you don\'t have the items you need to get out of this room yet.';
        }
    }
    else if (action === 'observe') {
        player.observe();
    }
    else if (action === 'use') {
        player.use(target);
    }
    else if (action === 'take') {
        gameInfoArea = '';
        player.take(target);
    }
    else if (action === 'inventory') {
        player.showInventory();
    }
    else if (action === 'help') {
        showCommands();
    }
    else {
        statusArea.innerText = 'I don\'t understand that command.  Please try again.';
    }
}

// Mainline
// Obtain reference to DOM objects and add listeners
let gameInfoArea = document.getElementById('game-info-area');
let action = document.getElementById('action');
let statusArea = document.getElementById('statusArea');
action.addEventListener('keypress', function (evt) {
    if (evt.key === 'Enter') {
        executeCommand();
    }
});

let player = '';

setupGame()
