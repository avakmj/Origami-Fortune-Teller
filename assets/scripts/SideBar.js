
// SideBar.js
import {fortunes} from '../fortunes.js';

let defaultFortunes; // initialize default fortunes

/*
    Handler for the fortune sidebar

    The sidebar needs to:
        - position buttons/accept edit requests
        - recive changes and update button values

    to do so, it uses a helper function for each
*/
export function activateSidebarHandler() {
  defaultFortunes = getFortunesFromStorage();
  if (!defaultFortunes) {
    defaultFortunes = fortunes.english.default;
  }

  activateSidebarButtons();
  activateFortuneInputHandler();
}

/*
    The sidebar is a vertical stack of buttons.

    We create the buttons here (to reduce styles and html
    clutter) then enable clicking to input new
    fortunes.
*/
function activateSidebarButtons() {
  // using defaultFortunes is a convenient
  // placeholder pending externalizing fortune
  // values and modularizing defaults
  const openSound = new Audio('assets/media/OpenFortune.mov');
  defaultFortunes.forEach((fortune, index) => {
    const button = document.createElement('button');
    button.textContent = fortune;

    button.addEventListener('click', () => {
      openFortuneInput(index);
      openSound.play();
    });

    getSidebar().appendChild(button);
  });
}

/*
    Set up the fortuneInputBox and display it.
*/
function openFortuneInput(buttonIndex) {
  getFortuneTextInput().value = getSidebarButtonContent(buttonIndex);
  getFortuneInputSaveButton().id = buttonIndex;
  getFortuneInputBox().style.display = 'block';
  getFortuneTextInput().focus();
  document.querySelector('.resetSide').style.display = 'none';

  const origamiContainer = document.querySelector('object');
  origamiContainer.style.pointerEvents = 'none';
}

/*
    Tears down the fortuneInputBox and optionally
    by parameter passes along its value to the
    button which activated it.

    @param (bool) needToSubmitFortune
*/
function closeFortuneInput(needTosubmitFortune=false) {
  getFortuneInputBox().style.display = 'none';
  document.querySelector('.resetSide').style.display = 'block';

  const origamiContainer = document.querySelector('object');
  origamiContainer.style.pointerEvents = 'auto';

  const closeSound = new Audio('assets/media/CloseFortune.mov');
  if (!needTosubmitFortune) {
    return;
  } else {
    const saveButton = getFortuneInputSaveButton();
    const userInput = getFortuneTextInput();

    setSidebarButtonContent(saveButton.id, userInput.value);
    userInput.value = '';

    saveButton.id = null;
    saveFortunes();
    closeSound.play();
  }
}

/*
    Handler for the fortuneInputBox

    submits when:
        - enter key in text input
        - changing fortune and losing focus
        - click save button

    doesn't submit when:
        - escape key
        - clicking anything other than the sidebar, input box, or save button
*/
function activateFortuneInputHandler() {
  getFortuneTextInput().addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      closeFortuneInput(true);
    }
  });

  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape') {
      closeFortuneInput();
    }
  });

  document.addEventListener('click', (event) => {
    if (isInputExitClick(event.target)) {
      closeFortuneInput();
    }
  });

  getFortuneInputSaveButton().addEventListener('click', () => {
    closeFortuneInput(true);
  });
}

/**
 * @function isInputExitClick helps click listener decide if fortune input should end based
 *  on a click
 * @param {Object} target - the target of a click event
 * @returns {boolean} - true if the click implies fortune input should exit
 */
function isInputExitClick(target) {
  const fortuneInputBox = getFortuneInputBox();
  const fortuneInputSaveButton = getFortuneInputSaveButton();

  const inputBoxBlocking = fortuneInputBox.style.display === 'block';

  const isNearSidebar = target.closest('.sidebar');
  const isSaveButton = target === fortuneInputSaveButton;
  const isInputBox = fortuneInputBox.contains(target);

  const isNearMissClick = isNearSidebar || isSaveButton || isInputBox;
  return inputBoxBlocking && !isNearMissClick;
}

function getFortuneInputSaveButton() {
  return document.querySelector('.fortuneInputBox .saveButton');
}

function getFortuneInputBox() {
  return document.querySelector('.fortuneInputBox');
}

function getFortuneTextInput() {
  return document.querySelector('.fortuneInputBox input');
}

function getSidebar() {
  return document.querySelector('.sidebar');
}

function getSidebarButtons() {
  return document.querySelectorAll('.sidebar button');
}

function getSidebarButtonContent(index) {
  return getSidebarButtons()[index].textContent;
}

function setSidebarButtonContent(index, content) {
  getSidebarButtons()[index].textContent = content;
}

/**
 * Saves the fortune to local storage in JSON format
 * @param {Array<Object>} fortune - Array of user inputted fortunes
 * @returns {boolean} - Returns true if the fortune was saved successfully
 */
function saveFortunesToStorage(fortunes) {
  return localStorage.setItem('fortunes', JSON.stringify(fortunes));
}

/**
 * Reads 'fortunes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage for 'fortune', an empty array
 * is returned.
 * @return {Array<Object>} An array of fortunes found in localStorage
 */
function getFortunesFromStorage() {
  const fortuneList = localStorage.getItem('fortunes');
  if (fortuneList == null) {
    return false;
  }
  return JSON.parse(fortuneList);
}

/**
 * Store all user fortunes in an array, then save to local storage
 * Activated when the Play button is clicked
 */
function saveFortunes() {
  const fortunes = [];
  const buttons = getSidebarButtons();

  buttons.forEach((button) => { // Loop through each button and put the text conent into the fortunes array
    fortunes.push(button.textContent);
  });
  saveFortunesToStorage(fortunes);
}

export function saveFortunesOnClick() {
  saveFortunes();
  const fortunes = getFortunesFromStorage();
  return fortunes;
}

/**
 * Resets the sidebar by clearing its content, generating new buttons, and clearing localStorage.
 * @function
 */
export function resetSidebar() {
  const sidebar = getSidebar();
  sidebar.innerHTML = '';
  activateSidebarButtons();
  localStorage.clear();
}
