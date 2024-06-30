/**
 * Script for drawing on a canvas element
 */

// Counters
let teamCount = 0; // design teams
let partyCount = 0; // knowledge parties

// Badge colors
const teamColor = '#0D6EFD';
const partyColor = '#04AA6D';
const centreColor = '#000000';
    
/**
 * Draw canvas
 * @param {*} canvasId Id of the canvas element
 */
function drawCanvas(canvasId) {
  var numSections = 7;
  var numCircles = 3;
  var innerRadius = 90;
  var deltaRadius = 30;
  var outerRadius = innerRadius + ((numCircles + 1) * deltaRadius);

  var canvas = document.getElementById(canvasId);

  // Check if the browser supports the canvas element
  if (canvas.getContext) {
    // Get the 2D drawing context
    var ctx = canvas.getContext('2d');

    // Fill the entire canvas with the white color
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate the center of the canvas
    var centerX = canvas.width / 2;
    var centerY = (canvas.height / 2) - 150;

    // Stap 1: Strategisch belang
    drawSlices(ctx, centerX, centerY, numSections, numCircles, innerRadius, outerRadius, Math.PI / 4, 'orange');

    // Draw a larger circle around it with a black border (radius three times as big)
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw a filled red circle at the center with a radius of 15
    ctx.fillStyle = centreColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Draw another circle around the previous one with a black border
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // Divide the space between the two outer circles into 7 sections with dotted lines        
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // Set the line dash pattern (5 pixels on, 5 pixels off)
    for (var section = 1; section <= numSections; section++) {
      var angle = ((section - 1) * (2 * Math.PI / numSections)) - Math.PI / 2;
      var innerX = centerX + innerRadius * Math.cos(angle);
      var innerY = centerY + innerRadius * Math.sin(angle);
      var outerX = centerX + outerRadius * Math.cos(angle);
      var outerY = centerY + outerRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();

      // Label each section with numbers (1 to 7) at the center of the section
      var labelAngle = angle + (Math.PI / numSections); // Add half of the angle between the sections
      var labelX = centerX + (210 + 60) / 2 * Math.cos(labelAngle);
      var labelY = centerY + (210 + 60) / 2 * Math.sin(labelAngle);

      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.fillText(section.toString(), labelX, labelY);
    }
    ctx.setLineDash([]); // Reset the line dash pattern

    // Draw three evenly spaced circles with dotted lines                
    ctx.setLineDash([5, 5]); // Set the line dash pattern
    circleRadius = innerRadius;

    for (var circle = 1; circle <= numCircles; circle++) {
      // Adjust the radius as needed
      circleRadius = circleRadius + deltaRadius;
      var angle = (2 * Math.PI / numCircles) * circle;
      var circleX = centerX;
      var circleY = centerY;

      // Draw the circle
      ctx.strokeStyle = 'grey'
      ctx.beginPath();
      ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw a dotted line from the center to the circle
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(circleX, circleY);
      ctx.stroke();
    }
    // Reset the line dash pattern
    ctx.setLineDash([]);

    // Stap 2: Ontwerpteams
    teamInputs = getTeamInputValues();
    labels = teamInputs['teamLabels']
    names = teamInputs['teamNames']

    const badgeRadius = 20;

    drawTeamBadgesAroundCenter(ctx, centerX, centerY, labels, innerRadius - (badgeRadius / 2) - 25);
    
    drawList(ctx, labels, names, 10, 500);

    // Stap 3: Kennisleverende partijen
    partyInputs = getPartyInputValues();
    labels = partyInputs['partyLabels']
    names = partyInputs['partyNames']

    drawList(ctx, labels, names, centerX+10, 500);
    
    sections = {};

    // Go over all knowledge parties
    for (let i = 0; i < partyInputs.partyLabels.length; i++) {
      partyLabel = partyInputs.partyLabels[i];
      partyBoxes = partyInputs.partyBoxes;       
      // Go over each checkbox      
      for (let j = 0; j < partyBoxes.length; j++) {
        // Input is checked
        if (partyBoxes[j].checked == true && partyBoxes[j].name.includes('id_' + partyLabel)) {          
          section_id = partyBoxes[j].value;
          // Add partyLabel to sections
          if (!sections[section_id]) {
            sections[section_id] = [];
          }
          sections[section_id].push(partyLabel);
        }
      }
    }

    drawPartyBadgesAroundEdge(ctx, centerX, centerY, numSections = 7, outerRadius, color = partyColor, sections)

  } else {
    // If the browser doesn't support the canvas element, display an error message
    alert('Your browser does not support the canvas element');
  }
}

/**
 * This function draws slices based on the form values under "Belangrijkheid"
 */
function drawSlices(ctx, centerX, centerY, numSections = 7, numCircles, innerRadius, outerRadius, sliceAngle, color = 'orange') {
  // Loop through the checkboxes and draw dots based on the selected ones
  for (var section = 1; section <= numSections; section++) {
    var inputName = 'r' + section;
    var input = document.querySelector('input[name="' + inputName + '"]');
    var likertValue = parseFloat(input.value);

    if (!isNaN(likertValue) && likertValue >= 1 && likertValue <= 4) {
      // Calculate the angle based on the section
      var startAngle = ((section - 1) * ((2 * Math.PI) / numSections)) - Math.PI / 2;
      var endAngle = startAngle + sliceAngle;

      // Draw the slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, ((((outerRadius - innerRadius) / (numCircles + 1)) * likertValue) + innerRadius), startAngle + 0.02, endAngle + 0.09);

      ctx.lineTo(centerX, centerY);
      ctx.fillStyle = color; // Slice background color
      ctx.fill();
    }
  }
}

/**
 * Draw team badges around the center of the canvas
 * @param {*} letters 
 * @param {*} badgeRadius 
 * @param {*} circleRadius 
 */
function drawTeamBadgesAroundCenter(ctx, centerX, centerY, letters, circleRadius) {
  const angleStep = (2 * Math.PI) / 10; // Angle between each badge (another option is letters.length)

  letters.forEach((letter, index) => {
    const angle = index * angleStep - (0.5 * Math.PI);
    const badgeCenterX = centerX + circleRadius * Math.cos(angle);
    const badgeCenterY = centerY + circleRadius * Math.sin(angle);
    drawBadge(ctx, badgeCenterX, badgeCenterY, letter, teamColor);
  });
}

/**
 * Draw badges around the outer edge of the circle.
 * @param {*} ctx context object
 * @param {*} centerX x-axis coordinate of center
 * @param {*} centerY y-axis coordinate of center
 * @param {*} numSections numer of sections
 * @param {*} radius badge radius 
 * @param {*} color badge color
 * @param {*} sections dictionary with section id and labels
 */
function drawPartyBadgesAroundEdge(ctx, centerX, centerY, numSections = 7, radius, color = 'green', sections) {

  // Calculate the angle step
  let angleStep = (2 * Math.PI) / numSections;

  // Loop through each section
  for (let section_id in sections) {
      let labels = sections[section_id];

      // Calculate the angle for this section
      // Calculate the angle for this section, adjusting so that section 1 starts at 12 o'clock
      let angle = -Math.PI / 2 + (section_id - 1) * angleStep + 0.05;

      // Calculate the x and y positions for the labels
      let x = centerX + radius * Math.cos(angle);
      let y = centerY + radius * Math.sin(angle);

      // Draw the labels
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      labels.forEach((label, index) => {
          let offsetAngle = angle + (index * (angleStep / labels.length));
          let badgeCenterX = centerX + (radius + 20) * Math.cos(offsetAngle);
          let badgeCenterY = centerY + (radius + 20) * Math.sin(offsetAngle);

          drawBadge(ctx, badgeCenterX, badgeCenterY, label, partyColor);
      });
  }
}


/** 
 * Add row for design team 
 **/
function addDesignTeamRow() {
  
  const designTeamLink = document.getElementById('addDesignTeam');
  
  // Toggle link
  if (teamCount >= 10) {
    if (designTeamLink) {
      designTeamLink.style.display = 'none';
    }    
    return;
  }

  if (designTeamLink) {
      designTeamLink.style.display = 'block';
  }  

  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const rowLabel = labels.charAt(teamCount);

  // Create new row
  const newRow = document.createElement('div');
  newRow.className = 'team row mb-2';
  newRow.innerHTML = `
          <div class="col-md-6">                                    
              <input type="hidden" name="teamLabel" value="${rowLabel}"/>    
              <span class="badge rounded-pill teamBadge">${rowLabel}</span>
              <input name="teamName" type="text" class="form-control d-inline-block w-auto">
              <img class="icon" src="img/delete.png" alt="delete icon" onclick="deleteRow(this, 2)"/>
          </div>
          <div class="col-md-6"></div>
      `;

  // Append the new row to the team container
  document.getElementById('designTeamContainer').appendChild(newRow);

  // Increment the row count
  teamCount++;

  // Add event listeners to checkboxes
  listenToTeamInputs();

  toggleTeamLink();
};

/**
 * Add row for knowledge party
 */
function addKnowledgePartyRow() {
  // Create new row
  const newRow = document.createElement('div');
  newRow.className = 'party row mb-2';
  newRow.innerHTML = `
          <div class="col-md-6">                                    
              <span class="badge rounded-pill partyBadge"><input type="hidden" name="partyLabel" value="${partyCount + 1}" />${partyCount + 1}</span>
              <input name="partyName" type="text" class="form-control d-inline-block w-auto">
              <img class="icon" src="img/delete.png" alt="delete icon" onclick="deleteRow(this, 3)"/>
          </div>
          <div class="col-md-6">
                <div class="row">
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="1">
                            <label class="form-check-label" for="d1">1</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="2">
                            <label class="form-check-label" for="d2">2</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="3">
                            <label class="form-check-label" for="d3">3</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="4">
                            <label class="form-check-label" for="d4">4</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="5">
                            <label class="form-check-label" for="d5">5</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" name="id_${partyCount + 1}" value="6">
                            <label class="form-check-label" for="d6">6</label>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="id_${partyCount + 1}_7" name="id_${partyCount + 1}" value="7">
                            <label class="form-check-label" for="id_${partyCount + 1}_7">7</label>
                        </div>
                    </div>
                </div>
          </div>
      `;

  // Append the new row to the team container
  document.getElementById('knowledgePartyContainer').appendChild(newRow);

  // Increment the row count
  partyCount++;

  // Add event listeners to text inputs
  listenToPartyInputs();
  // Add event listeners to checkboxes
  listenToCheckBoxes();

  togglePartyLink();
};

/**
 * 
 * @param {*} icon Id of delete icon
 * @param {*} step Number of step to delete row from
 */
function deleteRow(icon, step) {
  // Find the row containing the icon and remove it
  const row = icon.closest('.row');
  row.remove();

  // Decrement the row count
  if (step == '2') {
    teamCount--;
    updateTeamRowLabels();
    toggleTeamLink();
  }
  else if (step == '3') {
    partyCount --;
    updatePartyRowLabels();
    togglePartyLink();    
  }
  redraw('myCanvas');
}

function updateTeamRowLabels() {
  const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // Decrement the row count
  const rows = document.querySelectorAll('#designTeamContainer .team');
  
  rows.forEach((row, index) => {

    const badge = row.querySelector('.badge');
    const hiddenInput = row.querySelector('input[type="hidden"][name="teamLabel"]');
    const labelValue = labels.charAt(index);

    badge.textContent = labelValue;
    
    // Update the hidden input value
    if (hiddenInput) {
        hiddenInput.value = labelValue;
    }    
    
  });
}

function updatePartyRowLabels() {
  const rows = document.querySelectorAll('#knowledgePartyContainer .party');
  rows.forEach((row, index) => {
    const badge = row.querySelector('.badge');
    badge.textContent = index + 1;
  });
}

function toggleTeamLink() {
  const teamLink = document.getElementById('addDesignTeam');
  // Toggle link
  if (teamLink) {  
    if (teamCount >= 10) {
      teamLink.style.display = 'none';
      return;
    } else {
      teamLink.style.display = 'block';
    }  
  }
}

function togglePartyLink() {
  const partyLink = document.getElementById('addKnowledgeParty');
  // Toggle link
  if (partyLink) {  
    if (partyCount >= 10) {
      partyLink.style.display = 'none';
      return;
    } else {
      partyLink.style.display = 'block';
    }  
  }
}



/**
 * Draw a badge
 * @param {*} ctx context object
 * @param {*} centerX x-axis coordinate of badge centre
 * @param {*} centerY x-axis coordinate of badge centre
 * @param {*} text badge text
 * @param {*} color badge color
 */
function drawBadge(ctx, centerX, centerY, text, color='#0D6EFD') {
  // Badge properties
  const radius = 10;
  const backgroundColor = color; // Primary color
  const textColor = '#FFFFFF'; // White color
  const textFontSize = radius * 0.99; // Font size relative to the radius
  const textFont = `bold ${textFontSize}px Arial`;

  // Draw the badge circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = backgroundColor;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = backgroundColor;
  ctx.stroke();

  // Draw the letter
  ctx.fillStyle = textColor;
  ctx.font = textFont;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, centerY);
}


/**
 * Get the label and name of all design teams
 * @returns dict with team labels and names
 */
function getTeamInputValues() {
  // Get the form element by its ID
  const form = document.getElementById('myTeamForm');
  // Get all input elements with the name "teamLabel"
  const teamLabelInputs = form.querySelectorAll('input[name="teamLabel"]');
  // Get all input elements with the name "teamName"
  const teamNameInputs = form.querySelectorAll('input[name="teamName"]');

  // Create arrays to hold the values of the input elements
  const teamLabelValues = [];
  const teamNameValues = [];

  // Loop through each "teamLabel" input element and add its value to the array
  teamLabelInputs.forEach(input => {
    teamLabelValues.push(input.value);
  });

  // Loop through each "teamName" input element and add its value to the array
  teamNameInputs.forEach(input => {
    teamNameValues.push(input.value);
  });

  // Return the values as an object
  return {
    teamLabels: teamLabelValues,
    teamNames: teamNameValues
  };
}

/**
 * Get the label, name and checkboxes of all knowledge parties
 * @returns dict with team labels and names
 */
function getPartyInputValues() {
  // Get the form element by its ID
  const form = document.getElementById('myPartyForm');
  // Get all input elements with the name "partyLabel"
  const partyLabelInputs = form.querySelectorAll('input[name="partyLabel"]');
  // Get all input elements with the name "partyName"
  const partyNameInputs = form.querySelectorAll('input[name="partyName"]');
  // Get all checkbox elements
  const partyCheckBoxes = form.querySelectorAll('input[type="checkbox"]');

  // Create arrays to hold the values of the input elements
  const partyLabelValues = [];
  const partyNameValues = [];

  // Loop through each "partyLabel" input element and add its value to the array
  partyLabelInputs.forEach(input => {
    partyLabelValues.push(input.value);
  });

  // Loop through each "partyName" input element and add its value to the array
  partyNameInputs.forEach(input => {
    partyNameValues.push(input.value);
  });

  // Return the values as an object
  return {
    partyLabels: partyLabelValues,
    partyNames: partyNameValues,
    partyBoxes: partyCheckBoxes
  };
}


/**
 * Add event listeners to all text inputs on step 2.
 */
function listenToTeamInputs() {
  // Get the form element by its ID
  const form = document.getElementById('myTeamForm');
  // Get all input elements with the name "teamName"
  const teams = form.querySelectorAll('input[name="teamName"]');

  // Add event listener to each input
  teams.forEach(team => {
      team.addEventListener('change', (event) => {
          redraw('myCanvas');
      });
  });  
}

/**
 * Add event listeners to all text inputs on step 2.
 */
function listenToPartyInputs() {
  // Get the form element by its ID
  const form = document.getElementById('myPartyForm');
  // Get all input elements with the name "teamName"
  const parties = form.querySelectorAll('input[name="partyName"]');

  // Add event listener to each input
  parties.forEach(party => {
    party.addEventListener('change', (event) => {
          redraw('myCanvas');
      });
  });  
}

/**
 * Add event listeners to all checkboxes on step 3.
 */
function listenToCheckBoxes() {
  // Get all number inputs and checkbox elements
  boxes = document.querySelectorAll('input[type="checkbox"]');
  // Add event listener to each input and checkbox
  boxes.forEach(box => {
      box.addEventListener('change', (event) => {
          redraw('myCanvas');
      });
  });
}

/**
 *  Draw a table that has a maximum of 5 rows.
 * @param {*} ctx context object
 * @param {*} labels labels to draw
 * @param {*} names names to draw
 * @param {*} startX x-axis coordinate
 * @param {*} startY y-axis coordinate
 */
function drawList(ctx, labels, names, startX, startY) {
  // Set text properties
  ctx.font = '10px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = 'black';
  
  // Starting position for the text
  const lineHeight = 15; // Height between lines
  const midX = startX + 150; // Mid-point for right side drawing (adjust as needed)
  
  // Draw each label and name
  for (let i = 0; i < labels.length; i++) {
      // if (!names[i]) {
      //   continue;
      // }
      // Determine which side to draw on
      if (i < 5) {
          // Draw on the left side
          ctx.fillText(`${labels[i]}.`, startX, startY + (i * lineHeight));
          if (names[i]) {
            ctx.fillText(names[i], startX + 30, startY + (i * lineHeight));
          }
      } else {
          // Draw on the right side
          ctx.fillText(`${labels[i]}.`, midX, startY + ((i - 5) * lineHeight));
          ctx.fillText(names[i], midX + 30, startY + ((i - 5) * lineHeight));
      }     
  }
}




/**
 * Clear canvas
 */
function clearCanvas(canvasId) {
  var canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Download PNG image of canvas
function download(canvasId) {
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext('2d');

  // Create a data URL from the canvas
  var dataUrl = canvas.toDataURL('image/png');

  // Create a link element
  var downloadLink = document.createElement('a');

  // Set the download attribute to the desired filename
  downloadLink.download = 'canvas_image.png';

  // Set the href attribute to the data URL
  downloadLink.href = dataUrl;

  // Append the link to the body
  document.body.appendChild(downloadLink);

  // Trigger a click on the link to start the download
  downloadLink.click();

  // Remove the link from the body
  document.body.removeChild(downloadLink);
}

/**
 * Clear and redraw canvas
 */
function redraw(canvasId) {
  clearCanvas(canvasId);
  drawCanvas(canvasId);
}
/**
 * Reset form
 */
function reset(formIds, canvasId) {
  formIds.forEach(formId => {
    // Reset form values
    document.getElementById(formId).reset();
  });
  deleteTeams();
  deleteParties();

  // Clear canvas and redraw
  redraw(canvasId);
}

function deleteTeams() {
  // Get the designTeamContainer element
  const designTeamContainer = document.getElementById('designTeamContainer');

  // Remove all child nodes from knowledgePartyContainer
  while (designTeamContainer.firstChild) {
    designTeamContainer.removeChild(designTeamContainer.firstChild);
  }  
  teamCount = 0;
}

function deleteParties() {
  // Get the knowledgePartyContainer element
  const knowledgePartyContainer = document.getElementById('knowledgePartyContainer');

  // Remove all child nodes from knowledgePartyContainer
  while (knowledgePartyContainer.firstChild) {
      knowledgePartyContainer.removeChild(knowledgePartyContainer.firstChild);
  }  
  partyCount = 0;
}