const FetchData = async () => {
  const resp = await fetch(
    "https://noroff-komputer-store-api.herokuapp.com/computers"
  );
  const data = await resp.json();
  insertComputerData(data[0]); //first computer selected by default.
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

  const { title, description, specs, price, image } = data;

  titleEl.textContent = title;
  imgEl.setAttribute("src",`https://noroff-komputer-store-api.herokuapp.com/${image}`);
  descriptionEl.textContent = description;
  priceEl.textContent = `${price} NOK`;
  specs.some((spec, index) => {
    if (index <= 3) {
      liArray[index].textContent = spec;
    }
  });
};

let selectedComputer;

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

//work
const handleWork = () => {
  let currentPay = parseInt(payInput.value);
  const salary = 100;
  payInput.value = currentPay + salary;
};

//general methods for accounts and loans
const toggleElement = (element) => {
  element.classList.toggle("hide");
};

const toggleLoanInput = () => {
  let loanBalance = document.querySelector(".loans");
  toggleElement(loanBalance);
};

const toggleRepayBtn = () => {
  let repayBtn = document.querySelector(".repay-btn");
  toggleElement(repayBtn);
};

const toggleModal = () => {
  const modal = document.querySelector(".modal-container");
  modal.classList.toggle("hide");
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

//Loan errors
const maxLoanError = (loan, loanRequest, max) => {
  alert(`
  you cannot take out a loan of more than 2X your bankAccount
  you tried take a loan of ${loanRequest}.
  your bank balance is only ${loan}.
  the max loan amount should not be higher than ${max}
  `);
};

const numberOfLoansError = () => {
  alert(`
  you cannot get more than 1 loan. Shame on you!
  you have ${numberOfLoans} loan already.
  your have ${numberOfComputers} computers.
  Buy a computer!
  `);
};

const noMoneyError = () => {
  alert(`you dont have any money saved. 
  You need at least some money to take out a loan.`);
};
const zeroLoanError = () => {
  alert(`you tried to take out a loan of 0 kr. 
  you need to enter an amount`);
};

//get Loan

const submitLoan = () => {
  let bankAccountBalance = document.getElementById("bankAccount").value;
  let maxLoan = bankAccountBalance * 2;
  let requestedLoan = document.querySelector(".modal-loan-input").value;

  if (parseInt(bankAccountBalance) === 0) {
    noMoneyError();
  } else if (!requestedLoan) {
    zeroLoanError();
  } else if (numberOfLoans > 1 && numberOfComputers < 1) {
    numberOfLoansError();
  } else if (requestedLoan > maxLoan) {
    maxLoanError(bankAccountBalance, requestedLoan, maxLoan);
  } else {
    let loan = document.getElementById("loanAccount");
    loan.value = requestedLoan;
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
  let loanBalance = parseInt(loan.value);

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
  let currentLoan = parseInt(loan.value);

  if (downpayment >= currentLoan) {
    payInput.value = downpayment - currentLoan;
    loan.value = 0;
  } else {
    loan.value = currentLoan - downpayment;
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
  const price = document.querySelector(".price").value;

  if (price > bankAccount.value) {
    failedBuyAttempt(price);
    return;
  }
  let newBalance = parseInt(bankAccount.value) - parseInt(price);
  bankAccount.value = newBalance;
  numberOfComputers += 1;
  alert(`Congratulations! 
  You just bought this computer: ${selectedComputer}
  `);
};

//event listeners
document.querySelector(".buy-btn").addEventListener("click", buyComputer);
document.querySelector(".repay-btn").addEventListener("click", repayLoanClick);
document.querySelector(".modal-cta-btn").addEventListener("click", submitLoan);
document.querySelector(".bank-btn").addEventListener("click", handleBankTransfer);
document.querySelector(".work-btn").addEventListener("click", handleWork);
document.querySelector(".loan-btn").addEventListener("click", handleLoanRequest);
document.querySelector("#select-computer").addEventListener("change", handleComputerSelect);
