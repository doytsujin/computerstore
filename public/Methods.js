export const splitString = (string) => {
  return string.split(" ")[0];
}

export const toggleElement = (element, ...classes) => {
  classes.forEach(cl => {
    element.classList.toggle(cl);
  });
}

export const maxLoanError = (loan, loanRequest, max) => {
  alert(`
  you cannot take out a loan of more than 2X your bankAccount
  you tried take a loan of ${loanRequest}.
  your bank balance is only ${loan}.
  the max loan amount should not be higher than ${max}
  `);
}

export const numberOfLoansError = (numberOfLoans, numberOfComputers) => {
  alert(`
  you cannot get more than 1 loan. Shame on you!
  you have ${numberOfLoans} loan already.
  your have ${numberOfComputers} computers.
  Buy a computer!
  `);
}

export const noMoneyError = () => {
  alert(`you dont have any money saved. 
  You need at least some money to take out a loan.`);
}

export const zeroLoanError = () => {
  alert(`you tried to take out a loan of 0 kr. 
  you need to enter an amount`);
}