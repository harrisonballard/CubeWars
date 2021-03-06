const canvas = document.querySelector("#canvas");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WHITE = "rgb(255, 255, 255)";
let animationID;
const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(51, 255, 0)";
const GOODGUY = "goodguy";
const BADGUY = "badguy";
const BLASTER = "blaster";
let objects = [];
var playerDX = 0;
let score = 0;
let highScore = 0;

//TODO - UPDATE TO HAVE ARGUMENT SELECT WHICH IMAGE TO DRAW
//this constructs the objects, which have type player, bad guy, or blaster, spec'd by charType
function makeRectangle (x,y,height,width,color, charType) {
    return {
        x:x,
        y:y,
        height:height,
        width:width,
        color: color,
        charType: charType
    }
}

//helper function to randomize for badGuy spawn location
function randomInteger(min, max) {
    let range = max - min + 1
    let randomized = Math.floor(Math.random() * range)
    return min + randomized
}


//makes objects on the canvas interactive 
function getContext() {
    return canvas.getContext("2d");
    
}

//DOESNT NEED TO CHANGE IF MAKERECT CHANGE TO MAKESPRITE THAT LOADS IMAGE ITSELF 
//makes new badGuys at set interval; increase number in if statement to increase difficulty
function spawnBadGuy() {
    if (Math.random() < 0.008) {
    let bg = makeRectangle(randomInteger(30, 470), 40, 30, 30,RED,BADGUY);
    objects.push(bg);
    }
}

//TODO - ADAPT THIS FUNCTION TO THE NEW SPRITE IMAGE APPROACH 
//creates the rectangle within the context (basically so it shows up on the canvas and can be interactive)
function drawRect(rectangle) {
    let ctx = getContext();

    ctx.fillStyle = rectangle.color;
    ctx.fillRect(rectangle.x,rectangle.y,rectangle.width,rectangle.height);
}

//TODO - MAKE SURE CLEAR-RECT STILL WORKS WITH AN IMAGE SPRITE 
//removes movement trail for avatar 
function clearScreen() {
    let context = getContext();
    context.clearRect(0,0,WIDTH,HEIGHT);
}

//allows for update of badGuy position, increase value to increase difficulty (speed)
function updateBadGuyPosition(badGuy) {
    badGuy.y += 2;
}

//allows blaster to fire, decrease value to increase difficulty 
function updateBlasterPosition(blaster) {
    blaster.y -= 6;
}

//lets you move left and right and fire the blaster
function keyPressListener (event) {
if (event.key === "ArrowRight") {
    playerDX += 13;
  } else if (event.key === "ArrowLeft") {
    playerDX -= 13;
  } else if (event.key === " ") {
    let player = objects.find((o) => o.charType === "goodguy")
    let blaster = makeRectangle(player.x + 12.5, player.y - 2, 5, 5, GREEN, BLASTER);
    objects.push(blaster);
}
}

//TODO - DRAWRECT AND SPRITES?
//updates the frame to simulate animation
function drawFrame() {
    clearScreen();
    objectsLooper();
    spawnBadGuy();
    for (let item of objects) {
        drawRect(item);
    }
}


//allows player to move within defined range on canvas (no roll-overs from side to side)
function updateGoodGuyPosition(object) {
    object.x += playerDX
    playerDX = 0
    if (object.x < 20) {
        object.x = 20;
    } 
    else if (object.x > 480) {
        object.x = 480;
    }
}


//dispatcher for colliding objects, specs what f(x) runs depending on identities of colliding objects
function handleCollision(object1, object2) {
    if (object1.charType === GOODGUY && object2.charType === BADGUY) {
        handleGoodGuyBadGuyCollision();
    }
    if (object1.charType === BADGUY && object2.charType === GOODGUY) {
        handleGoodGuyBadGuyCollision();
    }
    if (object1.charType === BLASTER && object2.charType === BADGUY) {
        handleBlasterBadGuyCollision(object1, object2);
    }
    if (object1.charType === BADGUY && object2.charType === BLASTER) {
        handleBlasterBadGuyCollision(object1, object2);

    }
}

//ends game if the objects colliding have identities of good guy (player) and bad guy
function handleGoodGuyBadGuyCollision() {
    alert("GAME OVER. The Cubes Have Lost. Reload and Try Again.")
    tearDown()

}

//if a blaster hits a bad guy, it will remove both from the screen
function handleBlasterBadGuyCollision(object1, object2) {
    removeFromArray(objects, object1);
    removeFromArray(objects, object2);
    score += 10;
    document.getElementById("score").innerHTML = `Score = ${score}`;
    if (score > highScore) {
        highScore += 10;
        document.getElementById("highScore").innerHTML = `High Score = ${highScore}`
    }
}


//helper function to remove things from the screen
function removeFromArray(arr, obj) {    
    arr.splice(arr.indexOf(obj), 1); 
    }

//dispatcher for movement of the different objects, fires f(x) based on identity of object to update appropriate position
function updatePosition(object) {
    if (object.charType === GOODGUY) {
        updateGoodGuyPosition(object);
    }

    if (object.charType === BADGUY) {
        updateBadGuyPosition(object);
    }
    if (object.charType === BLASTER) {
        updateBlasterPosition(object);
    }
}

//function to check if any 2 objects are colliding, checks every frame
function isColliding(object1, object2) {
        if (object1.x < object2.x+object2.width && 
            object1.x + object1.width > object2.x && 
            object1.y < object2.y+object2.height &&
            object1.y + object1.height > object2.y) {
            return true;
        }
        else {
            return false;
        }
    }


//loops to update objects in the objects array (removes them when objects collide AKA badGuy gets hit or goodGuy dies)
function objectsLooper() {
    for (let i = 0; i < objects.length; i++) {
        let currentObject = objects[i];
        updatePosition(currentObject);
        for (let j = 0; j < objects.length; j++) {
            if ( i !== j && isColliding(currentObject, objects[j])) {
                handleCollision(currentObject, objects[j]);
            }
        }
    }
}

//start the game.
function startUp() {
    animationID = window.setInterval(drawFrame, 20);
    document.querySelector("#start-button").setAttribute("disabled", true);
    let player = makeRectangle(250, 470, 30, 30, WHITE, GOODGUY);
    objects.push(player);
    drawRect(player);
}
//stop the game.
function tearDown() {
    window.clearInterval(animationID);
    document.querySelector("#start-button").removeAttribute("disabled");
    objects.splice(0);
    score = 0;
    highScore = highScore;
    document.getElementById("score").innerHTML = `Score = 0`;
    clearScreen()
}


//just event listeners for the start and stop buttons
window.addEventListener("keydown", keyPressListener);
document.querySelector("#start-button").addEventListener("click", startUp);
document.querySelector("#stop-button").addEventListener("click", tearDown);


