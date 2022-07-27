/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './map';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alert';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const settingForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const bookTourBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(locations);
}

// LOGIN
if (loginForm) {
  document.querySelector('.form').addEventListener('submit', (e) => {
    // prevent form to load page
    e.preventDefault();
    // VALUES
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// UPDATE SETTING
if (settingForm) {
  settingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save--data').textContent = 'Updating...';

    // VALUES
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    // console.log(form);

    await updateSettings('data', form);
    document.querySelector('.btn--save--data').textContent = 'SAVE SETTINGS';
  });
}

// UPDATE PASSWORD
if (passwordForm) {
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save--password').textContent = 'Updating...';

    // VALUES
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings('password', {
      passwordCurrent,
      password,
      passwordConfirm,
    });

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';

    document.querySelector('.btn--save--password').textContent =
      'SAVE PASSWORD';
  });
}

if (bookTourBtn) {
  bookTourBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    // console.log(tourId);
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
