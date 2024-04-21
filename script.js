'use strict';

// DATA

const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  
    movementsDates: [
      "2019-11-18T21:31:17.178Z",
      "2019-12-23T07:42:02.383Z",
      "2020-01-28T09:15:04.904Z",
      "2020-04-01T10:17:24.185Z",
      "2020-05-08T14:11:59.604Z",
      "2020-07-26T17:01:17.194Z",
      "2020-07-28T23:36:17.929Z",
      "2020-08-01T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT", 
  };
  
  const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  
    movementsDates: [
      "2019-11-01T13:15:33.035Z",
      "2019-11-30T09:48:16.867Z",
      "2019-12-25T06:04:23.907Z",
      "2020-01-25T14:18:46.235Z",
      "2020-02-05T16:33:06.386Z",
      "2020-04-10T14:43:26.374Z",
      "2020-06-25T18:49:59.371Z",
      "2020-07-26T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
  };
    
const accounts = [account1, account2];

///////////////////////////////////////

// ELEMENTS
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.sort__btn');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');


//////////////////////////////////////
let currentAccount;
let timer;

// Creating User Names 
const createUserNames = function(accs){
  accs.forEach(acc => {
    acc.userName = acc.owner
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
  })
}
createUserNames(accounts);

// Format Currency International
const formatCur = function (value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

// Setup Logout Timer
const startLogOutTimer = function() {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the remaining time in UI
    labelTimer.textContent = `${min}:${sec}`;

    // when 0 seconds, stop timer and log out the user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = '0';
    }
    // Decres 1s
    time--;
  }
    // Set Time 5 Minutes
    let time = 5 * 60;

    // Call Timer Every Seconds 
    tick();
    const timer = 
    setInterval(tick, 1000) ;
    return timer;
}









// Calculate User Account Balance
const calcDisplayBalance = function (acc) {
  acc.balance = 
    acc.movements
    .reduce((accu, mov) => accu + mov, 0)
    .toFixed(2);
  labelBalance.textContent =
    formatCur(acc.balance, acc.locale, acc.currency); 
}
// Calculating User Account Summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
  .filter(mov => mov > 0)
  .reduce((accu, mov) => accu + mov, 0)
  .toFixed(2);
  labelSumIn.textContent =formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
  .filter(mov => mov < 0)
  .reduce((accu, mov) => accu + mov, 0)
  .toFixed(2);
  labelSumOut.textContent = formatCur(Math.abs(out),acc.locale, acc.currency);

  const interest = acc.movements
  .filter(mov => mov > 0)
  .map(deposit => deposit * acc.interestRate/100)
  .filter(int => int > 1)
  .reduce((accu, mov) => accu + mov, 0)
  .toFixed(2);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
}


// Display Account Movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  
  movs.forEach(function(mov, i){
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = `${date.getFullYear()}`;
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    const displayDate = `${day}/${month}/${year}`;
    //////////////////////////////////////
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  })
}




const updateUI = function (acc) {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovements(acc);
}

// EVENT HANDLERS

// user login
const loginUser = function (e) {
  e.preventDefault();

  // Check Credentials
  currentAccount = accounts.find(
    acc => {
    return acc.userName === inputLoginUsername.value  && acc.pin === Number(inputLoginPin.value);
    }
  )

  if(!currentAccount) return;

  // Display UI & Welcome
  containerApp.style.opacity = '1';
  labelWelcome.textContent = `Welcome ${currentAccount.owner.split(' ')[0]}`;

  // Clear Input Fields 
  inputLoginUsername.value = inputLoginPin.value = '';

  // Print Date & Time 
  const now = new Date();
  const day = `${now.getDate()}`.padStart(2, 0);
  const month = `${now.getMonth()}`.padStart(2, 0);
  const year = `${now.getFullYear()}`;
  const hour = `${now.getHours()}`.padStart(2, 0);
  const minute = `${now.getMinutes()}`.padStart(2, 0);
  labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

  // Start Logout Timer
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  // UPDATING UI
  updateUI(currentAccount);
};

// user transfer money
const handleTransfer = function (e) {
  e.preventDefault();

  const receiverAcc = accounts.find(
    acc => inputTransferTo.value === acc.userName && 
    inputTransferTo.value !== currentAccount.userName
  );


  const amount = Number(inputTransferAmount.value);
  // Check Amount
  if (
      amount > 0 &&
      amount <= currentAccount.balance &&
      receiverAcc
    ){
    // Doing Transfer
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);
    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Clear Input  
    inputTransferTo.value = inputTransferAmount.value = '';
    // Update UI
    updateUI(currentAccount);
    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
}

// Request Loan
const requestLoan = function (e) {
  e.preventDefault();
  
  const movs = currentAccount.movements;
  const amount = Number(inputLoanAmount.value);
  const isEligible = movs
    .filter(mov => mov > 0)
    .some(mov => mov >= (amount * 0.1));

  if(amount > 0 && isEligible) {
    // Add Movement
    movs.push(amount);
    // Add Transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    // Clear Input 
    inputLoanAmount.value = '';
    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
}

// Close Account
const closeAcount = function (e) {
  e.preventDefault();

  // Check Credentials 
  if (
  inputCloseUsername.value === currentAccount.userName &&
  Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.userName === currentAccount.userName);

    // Delete Account
    accounts.splice(index, 1);
    // Hide UI & Logout User
    containerApp.style.opacity = '0';
    labelWelcome.textContent = 'Log in to get started';
    // Clear Input
    inputCloseUsername.value = inputClosePin.value = '';

  }
}


// EVENT LISTENERS

btnLogin.addEventListener('click', loginUser);
inputLoginPin.addEventListener('keydown', e =>{
  if(e.code === 'Enter') loginUser(e);
})

btnTransfer.addEventListener('click', handleTransfer);
btnLoan.addEventListener('click', requestLoan);
btnClose.addEventListener('click', closeAcount);

let sorted = false;
btnSort.addEventListener('click', function (e) {
  // Display Movements Sorted
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})