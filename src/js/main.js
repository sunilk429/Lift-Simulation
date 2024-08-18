// Fetching elements by Id's
const inputForm = document.getElementById("input-form");
const output = document.getElementById("output");

//Hide the output/UI initially
output.style.display = "none";

//Event Listener for submit button
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //fetching floors and lift values
  const floors = document.getElementById("input-floors").value;
  const lifts = document.getElementById("input-lifts").value;

  // Constructing floors
  const floorsArray = Array.from({ length: floors }, (_, i) => floors - i);
  floorsArray.forEach((floor) => {
    const floorDiv = document.createElement("div");
    floorDiv.classList.add("floor");
    floorDiv.innerHTML = `<h2>Floor ${floor}</h2>`;

    //Add buttons for each floor
    const controllerDiv = document.createElement("div");
    controllerDiv.classList.add("controller");
    //create upButton

    const upButton = document.createElement("button");
    upButton.innerHTML = "Up";
    upButton.classList.add("button");
    upButton.classList.add("button-up");

    //create downButton
    const downButton = document.createElement("button");
    downButton.innerHTML = "Down";
    downButton.classList.add("button");
    downButton.classList.add("button-down");
    //Adding buttons to controller
    if (floor !== floorsArray[0]) {
      controllerDiv.appendChild(upButton);
    }
    if (floor !== floorsArray[floorsArray.length - 1]) {
      controllerDiv.appendChild(downButton);
    }

    floorDiv.appendChild(controllerDiv);

    output.appendChild(floorDiv);
  });

  // Constructing lifts
  const liftsArray = Array.from({ length: lifts }, (_, i) => i + 1);
  liftsArray.forEach((lift) => {
    const liftDiv = document.createElement("div");
    liftDiv.classList.add("lift");
    liftDiv.innerHTML = `<h2>${lift}</h2>`;
    output.lastElementChild.appendChild(liftDiv);
  });

  //Hide the input form
  inputForm.style.display = "none";
  //Display the output/UI
  output.style.display = "block";
});
