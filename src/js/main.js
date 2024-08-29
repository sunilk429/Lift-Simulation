const inputForm = document.getElementById("input-form");
const output = document.getElementById("output");

output.style.display = "none"; // Hide output/UI initially

const state = {
  floors: 0,
  lifts: [],
  requests: [],
  //   isProcessing: false,
};

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Fetching floor and lift values
  const floors = Number(document.getElementById("input-floors").value);
  const lifts = Number(document.getElementById("input-lifts").value);
  if (floors < 1) {
    inputForm.style.display = "none"; // Hide input form
    output.style.display = "block"; // Display output/UI
    return `<div></div>`;
  }
  state.floors = floors;

  // Initialize lifts
  for (let i = 0; i < lifts; i++) {
    state.lifts.push({
      id: i + 1,
      currentFloor: 1,
      isMoving: false,
      targetFloor: null,
    });
  }

  // Constructing floors
  const floorsArray = Array.from(
    { length: state.floors },
    (_, i) => state.floors - i
  );

  floorsArray.forEach((floor) => {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");

    const floorNumber = document.createElement("h2");
    floorNumber.textContent = `Floor ${floor}`;

    const controllerDiv = document.createElement("div");
    controllerDiv.classList.add("controller");

    const upButton = document.createElement("button");
    upButton.innerHTML = "Up";
    upButton.classList.add("button", "button-up");

    const downButton = document.createElement("button");
    downButton.innerHTML = "Down";
    downButton.classList.add("button", "button-down");
    console.log(floorsArray[0]);
    if (floor === 1 && lifts > 0) controllerDiv.appendChild(upButton);
    if (floor !== floorsArray[0]) controllerDiv.appendChild(upButton);
    if (floor !== floorsArray[floorsArray.length - 1])
      controllerDiv.appendChild(downButton);

    const liftContainerDiv = document.createElement("div");
    liftContainerDiv.classList.add("lift-container");

    floorDiv.appendChild(floorNumber);
    if (lifts !== 0) {
      floorDiv.appendChild(controllerDiv);
    }
    floorDiv.appendChild(liftContainerDiv);
    output.appendChild(floorDiv);

    upButton.addEventListener("click", () => {
      //Disable button
      upButton.disabled = true;
      addRequest(floor, "up");
    });
    downButton.addEventListener("click", () => {
      //Disable button
      downButton.disabled = true;
      addRequest(floor, "down");
    });
  });

  const firstFloorLiftContainer =
    output.lastElementChild.querySelector(".lift-container");
  state.lifts.forEach((lift, index) => {
    const liftDiv = document.createElement("div");
    liftDiv.classList.add("lift");
    liftDiv.innerHTML = `
      <div class="lift-doors">
      <div class="door-left"></div>
      <div class="door-right"></div>
      </div>
      `;
    firstFloorLiftContainer.appendChild(liftDiv);
  });

  inputForm.style.display = "none"; // Hide input form
  output.style.display = "block"; // Display output/UI

  // Calculate dynamic width for each floor based on the number of lifts
  const liftWidth = 80; // Each lift's width in px
  const gap = 10; // Gap between lifts in px
  const totalWidth = lifts * (liftWidth + gap); // Total width needed
  // Calculate floor width
  const floorWidth = document.querySelector(".floor").offsetWidth;

  document.querySelectorAll(".floor").forEach((floor) => {
    floor.style.minWidth = `${totalWidth + floorWidth}px`; // Apply width directly to .floor
  });
});

function addRequest(floor, direction) {
  console.log("addRequest", floor, direction);
  // Check if a request already exists for the same floor and direction
  const existingRequest = state.requests.find(
    (req) => req.floor === floor && req.direction === direction
  );

  if (!existingRequest) {
    state.requests.push({ floor, direction });
  }
}

// Process the requests in the queue
function processRequests() {
  // If the queue is empty, do nothing
  if (state.requests.length === 0) return;

  // Get the first request in the queue
  const currentRequest = state.requests[0];

  const availableLift = findNearestLift(currentRequest.floor);

  if (availableLift) {
    moveLift(availableLift, currentRequest.floor, currentRequest.direction);
    // Remove the processed request from the queue
    state.requests.shift();
  }
}

// Find the nearest available lift
function findNearestLift(requestedFloor) {
  // If no lifts are on the requested floor or if lifts are busy, find the nearest available lift
  let nearestLift = null;
  let minDistance = state.floors + 1;

  for (let lift of state.lifts) {
    // Check if lift is available and not already moving
    if (lift.isMoving) {
      continue;
    }

    const distance = Math.abs(lift.currentFloor - requestedFloor);
    if (distance < minDistance) {
      minDistance = distance;
      nearestLift = lift;
    }
  }

  // Return the nearest lift if found, otherwise null
  if (nearestLift) {
    console.log("Nearest available lift found:", nearestLift);
  } else {
    console.log("No available lift found.");
  }

  return nearestLift;
}

// Move the lift to the target floor
function moveLift(lift, targetFloor, direction) {
  if (!lift.isMoving) lift.isMoving = true;
  lift.targetFloor = targetFloor; // Track the target floor the lift is heading to
  //   lift.direction = direction; // Track the Called Direction
  //   console.log("Moving Lifts:");
  //   state.lifts.forEach((lift) => {
  //     console.log(lift.id, lift.currentFloor, lift.targetFloor, lift.isMoving);
  //   });
  //Dynamically getting the floor height
  const floorHeight = document.querySelector(".floor").offsetHeight;

  // Calculate the time it should take to reach target floor
  const travelTime = Math.abs(targetFloor - lift.currentFloor) * 2000;
  const liftDiv = document.querySelector(`.lift:nth-child(${lift.id})`);
  const doorDiv = liftDiv.querySelector(".lift-doors");

  // Animate Lift
  liftDiv.style.transition = `transform ${travelTime}ms linear`;
  liftDiv.style.transform = `translateY(-${(targetFloor - 1) * floorHeight}px)`;

  // After the lift reaches the target floor
  setTimeout(() => {
    lift.currentFloor = targetFloor;
    doorDiv.classList.add("door-open");

    setTimeout(() => {
      doorDiv.classList.remove("door-open");

      setTimeout(() => {
        lift.isMoving = false;
        lift.targetFloor = null; // Reset the target floor after the lift stops
        // lift.direction = null; // Reset the direction after the lift stops
        // After the lift finishes, call DeQueueRequests to handle the next request

        // console.log("Before Dequeue: ", state.requests);
        // // state.requests.shift();
        // console.log("After Dequeue: ", state.requests);

        // Re-enable the up and down buttons for the target floor
        const floorDiv =
          document.querySelectorAll(".floor")[state.floors - targetFloor]; // Get the correct floor element
        const upButton = floorDiv.querySelector(".button-up");
        const downButton = floorDiv.querySelector(".button-down");

        // Re-enable buttons if they exist
        const currentTime = Math.floor(Date.now());

        if (direction === "up" && upButton) {
          console.log("enabled up button");
          upTime = currentTime;
          upButton.disabled = false;
        } else if (direction === "down" && downButton) {
          console.log("enabled down button");
          downTime = currentTime;
          downButton.disabled = false;
        }
      }, 2500); // Close doors after a delay
    }, 2500); // Keep doors open for 2.5 seconds
  }, travelTime);
}

setInterval(() => {
  processRequests();
}, 1000);
