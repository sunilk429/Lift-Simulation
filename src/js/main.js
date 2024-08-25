const inputForm = document.getElementById("input-form");
const output = document.getElementById("output");

output.style.display = "none"; // Hide output/UI initially

const state = {
  floors: 0,
  lifts: [],
  requests: [],
};

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Fetching floor and lift values
  const floors = Number(document.getElementById("input-floors").value);
  const lifts = Number(document.getElementById("input-lifts").value);

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

    if (floor !== floorsArray[0]) controllerDiv.appendChild(upButton);
    if (floor !== floorsArray[floorsArray.length - 1])
      controllerDiv.appendChild(downButton);

    const liftContainerDiv = document.createElement("div");
    liftContainerDiv.classList.add("lift-container");

    floorDiv.appendChild(floorNumber);
    floorDiv.appendChild(controllerDiv);
    floorDiv.appendChild(liftContainerDiv);
    output.appendChild(floorDiv);

    upButton.addEventListener("click", () => handleClick(floor, "up"));
    downButton.addEventListener("click", () => handleClick(floor, "down"));
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
  const totalWidth = lifts * (liftWidth + 1.5 * gap); // Total width needed
  // Calculate floor width
  const floorWidth = document.querySelector(".floor").offsetHeight;
  console.log("floorWidth", floorWidth);
  document.querySelectorAll(".floor").forEach((floor) => {
    floor.style.minWidth = `${totalWidth + floorWidth}px`; // Apply width directly to .floor
  });
});

// Click handler for Controller buttons
function handleClick(floor, direction) {
  // Check if a request already exists in the queue
  const isRequestAlreadyExists = state.requests.some(
    (request) => request.floor === floor && request.direction === direction
  );

  // Check if any lift is already moving to this floor
  const isLiftAlreadyMoving = state.lifts.some(
    (lift) => lift.isMoving && lift.targetFloor === floor
  );

  if (isRequestAlreadyExists || isLiftAlreadyMoving) return; // Prevent duplicate requests

  // Queue incoming requests
  state.requests.push({ floor, direction });

  // Start processing the requests
  DeQueueRequests();
}
// Dequeue pending requests
function DeQueueRequests() {
  // If there are requests to process, handle them
  if (state.requests.length > 0) {
    const request = state.requests.shift(); // Get the first request in queue
    const isRequestHandled = handleRequests(request.floor); // Try to handle the request

    // If no lift can handle the request right now, re-add it to the queue
    if (!isRequestHandled) {
      state.requests.unshift(request);
    }
  }
}

// Handle the request by finding the nearest lift
function handleRequests(requestedFloor, direction) {
  const nearestLift = findNearestLift(requestedFloor); // Find the nearest lift
  if (nearestLift) {
    moveLiftToFloor(nearestLift, requestedFloor, direction); // Move lift to target floor
    return true;
  }
  return false;
}

// Find the nearest available lift
function findNearestLift(requestedFloor) {
  let nearestLift = null;
  let minDistance = state.floors + 1;

  state.lifts.forEach((lift) => {
    // Check if lift is available and not already moving
    if (!lift.isMoving) {
      const distance = Math.abs(lift.currentFloor - requestedFloor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = lift;
      }
    }
  });

  return nearestLift;
}

// Move the lift to the target floor
function moveLiftToFloor(lift, targetFloor, direction) {
  lift.isMoving = true;
  lift.targetFloor = targetFloor; // Track the target floor the lift is heading to
  //   lift.direction = direction; // Track the Called Direction

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
        // state.requests.shift();
        DeQueueRequests();
      }, 2500); // Close doors after a delay
    }, 2500); // Keep doors open for 2.5 seconds
  }, travelTime);
}
