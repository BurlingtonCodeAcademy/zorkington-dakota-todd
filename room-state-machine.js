let library = {room: 'library'}
let kitchen = {room: 'kitchen'}
let study = {room: 'study'}
let bathroom = {room: 'bathroom'}
let closet = {room: 'closet'}
let masterBedroom = {room: 'master bedroom'}
let diningRoom = {room : 'dining room'}

let roomLookup = {
  library: library,
  kitchen: kitchen,
  study: study,
  bathroom: bathroom,
  'master bedroom' : masterBedroom,
  closet : closet,
  'dining room' : diningRoom
}

// ----------------Below here is all state machine-----------------
let room = library

let canChangeTo = {
  library: [kitchen],
  kitchen: [diningRoom, library],
  'dining room' : [kitchen, closet, study],
  study: [diningRoom, masterBedroom],
  closet: [diningRoom],
  bathroom: [masterBedroom],
  'master bedroom': [bathroom, study]
  
}

function changeRoom(nextState) {
  let currentState = room
  console.log('-------------------------------------');
  console.log('Current room is ' + currentState.room);
  console.log('Attempting to move to:  ' + nextState)

  if(canChangeTo[currentState.room].includes(roomLookup[nextState])) {
    room = roomLookup[nextState]
    console.log('Room Change successful');
  } else {
    console.log(`Unable to move to that room`);
  }
}

changeRoom('kitchen')
changeRoom('study')
changeRoom('library')
changeRoom('kitchen')
changeRoom('diningRoom')
