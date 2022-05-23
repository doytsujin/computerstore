import {splitString, toggleElement, maxLoanError, noMoneyError, zeroLoanError, numberOfLoansError} from './Methods.js';
let selectedComputer;

const FetchData = async () => {
  const resp = await fetch(
    "https://noroff-komputer-store-api.herokuapp.com/computers"
  );
  const data = await resp.json();
  insertComputerData(data[0]); //first computer selected by default.
  selectedComputer = data[0].title;
  return data;
};

const getItemByTitle = async (title) => {
  const data = await FetchData();
  const filteredData = await data.filter((item) => item.title.includes(title));
  return filteredData;
};

const insertOptions = () => {
  const selectEl = document.querySelector("#select-computer");

  Promise.resolve(FetchData())
    .then((data) =>
      data.forEach((item) => {
        const optionsEl = document.createElement("option");
        const optionsContent = document.createTextNode(item.title);
        optionsEl.setAttribute("value", `${item.title}`);
        optionsEl.setAttribute("id", `${item.id}`);
        optionsEl.appendChild(optionsContent);
        selectEl.appendChild(optionsEl);
      })
    )
    .catch((error) => console.log("there was an ", error));
};
insertOptions();

const insertComputerData = (data) => {
  const titleEl = document.querySelector(".h1-big");
  const imgEl = document.querySelector(".computer-image");
  const descriptionEl = document.querySelector(".description");
  const priceEl = document.querySelector(".price");
  const liArray = document.querySelector(".specs").children;

  const {id, title, description, specs, price, image } = data;

  titleEl.textContent = title;
  descriptionEl.textContent = description;
  priceEl.textContent = `${price} NOK`;

  if (id===5) {
    imgEl.setAttribute("src",`https://noroff-komputer-store-api.herokuapp.com/assets/images/5.png`);
  } else {
    imgEl.setAttribute("src",`https://noroff-komputer-store-api.herokuapp.com/${image}`);
  }

  specs.some((spec, index) => {
    if (index <= 3) {
      liArray[index].textContent = spec;
    }
  });
};

const handleComputerSelect = (event) => {
  Promise.resolve(getItemByTitle(event.target.value))
    .then((data) => {
      insertComputerData(data[0]);
      selectedComputer = data[0].title;
    })
    .catch((error) => console.log("there was an ", error));
};

let numberOfLoans = 0;
let numberOfComputers = 0;
const payInput = document.getElementById("pay");
const bankAccount = document.getElementById("bankAccount");
const loan = document.getElementById("loanAccount");
const modalInput = document.querySelector(".modal-loan-input");
const modal = document.querySelector(".modal-container");

//work
const handleWork = () => {
  let currentPay = parseInt(payInput.value);
  const salary = 100;
  payInput.value = currentPay + salary;
};

const toggleLoanInput = () => {
  let loanBalance = document.querySelector(".loans");
  toggleElement(loanBalance, 'hide');
}

const toggleRepayBtn = () => {
  let repayBtn = document.querySelector(".repay-btn");
  toggleElement(repayBtn, 'hide');
}

const toggleModal = () => {

  let modalClasses = Array.from(modal.classList);
  if (modalClasses.includes('hide')) {
    toggleElement(modal, 'hide', 'animate-modal');
  } else {
    toggleElement(modal, 'animate-modal'); //animate out class - make it.
    setTimeout(() => {
      toggleElement(modal, 'hide');
    }, 1000);
  }
  
  window.removeEventListener("click", hideModal);
  window.removeEventListener("keydown", submitLoanByKeydown);
};

const hideModal = (event) => {
  const modalClasses = Array.from(event.target.classList);
  const isModal = modalClasses.filter((cl) => cl === "modal");
  if (isModal.length === 0) {
    toggleModal();
  }
};

const handleLoanRequest = () => {
  if (numberOfLoans) {
    numberOfLoansError();
    return;
  }
  toggleModal();
  setTimeout(() => {
    window.addEventListener("click", hideModal);
    window.addEventListener("keydown", submitLoanByKeydown);
  }, 50);
};

const removeLoan = () => {
  toggleRepayBtn();
  toggleLoanInput();
  numberOfLoans -= 1;
};


// set loan
// document.querySelector('.modal-label').textContent= `Amount [kr]:`
const handleIncrementLoan = () => {
  let currentLoanInput = parseInt(splitString(modalInput.value));
  modalInput.value = `${currentLoanInput + 50} kr`;
} 
//get Loan

const submitLoan = () => {
  let bankAccountBalance = parseInt(bankAccount.value);
  let maxLoan = bankAccountBalance * 2;
  let requestedString = modalInput.value;
  let requestedLoan = parseInt(splitString(requestedString)); //remove kr;

  if (bankAccountBalance === 0) {
    noMoneyError();
  } else if (!requestedLoan) {
    zeroLoanError();
  } else if (numberOfLoans > 1 && numberOfComputers < 1) {
    numberOfLoansError(numberOfLoans, numberOfComputers);
  } else if (requestedLoan > maxLoan) {
    maxLoanError(bankAccountBalance, requestedLoan, maxLoan);
  } else {
    bankAccount.value = bankAccountBalance + requestedLoan;
    loan.value = requestedLoan * (-1);
    
    console.log(requestedLoan, typeof requestedLoan);
    toggleLoanInput();
    toggleRepayBtn();
    numberOfLoans += 1;
  }
  toggleModal();
};

const submitLoanByKeydown = (event) => {
  if (event.keyCode === 13) {
    submitLoan();
  }
  return;
};

const handleBankTransfer = () => {
  let newBankBalance;
  let loanBalance = parseInt(loan.value) *(-1);
  console.log(typeof loanBalance, loanBalance);
  

  if (numberOfLoans) {
    let saved = (parseInt(payInput.value) * 90) / 100;
    let repayed = (parseInt(payInput.value) * 10) / 100;

    if (repayed > loanBalance) {
      saved += repayed - loanBalance;
      repayed = loanBalance;
    }
    newBankBalance = parseInt(bankAccount.value) + saved;
    doLoanPayment(repayed);
  } else {
    newBankBalance = parseInt(bankAccount.value) + parseInt(payInput.value);
  }
  bankAccount.value = newBankBalance;
  payInput.value = 0;
};

const doLoanPayment = (downpayment) => {
  let currentLoan = parseInt(loan.value) *(-1);

  if (downpayment >= currentLoan) {
    payInput.value = downpayment - currentLoan;
    loan.value = 0;
  } else {
    loan.value = (currentLoan - downpayment) *(-1);
    payInput.value = 0;
  }
  if (parseInt(loan.value) === 0) {
    removeLoan();
  }
};

const repayLoanClick = () => {
  let currentPay = parseInt(payInput.value);
  doLoanPayment(currentPay);
};

//buy computer
const failedBuyAttempt = (price) => {
  alert(`
  you dont have enough money to buy this computer.
  you have ${bankAccount.value} in your bank account.
  the current price is ${price}.
  Either buy a cheaper computer or save more money!
  `);
};


const buyComputer = () => {
  const priceString = document.querySelector(".price").textContent;
  let price = parseInt(splitString(priceString)); //remove NOK from string.
  let bankAccountBalance = parseInt(bankAccount.value);

  console.log(typeof bankAccountBalance)

  if (price > bankAccountBalance) {
    failedBuyAttempt(price);
    return;
  }
  let newBalance = bankAccountBalance - price;
  console.log(newBalance, typeof newBalance);
  bankAccount.value = newBalance;
  numberOfComputers += 1;
  alert(`Congratulations! 
  You just bought this computer: ${selectedComputer}
  `);
};

//event listeners
document.querySelector('.modal-increment-btn').addEventListener('click',handleIncrementLoan);
document.querySelector(".buy-btn").addEventListener("click", buyComputer);
document.querySelector(".repay-btn").addEventListener("click", repayLoanClick);
document.querySelector(".modal-cta-btn").addEventListener("click", submitLoan);
document.querySelector(".bank-btn").addEventListener("click", handleBankTransfer);
document.querySelector(".work-btn").addEventListener("click", handleWork);
document.querySelector(".loan-btn").addEventListener("click", handleLoanRequest);
document.querySelector("#select-computer").addEventListener("change", handleComputerSelect);
