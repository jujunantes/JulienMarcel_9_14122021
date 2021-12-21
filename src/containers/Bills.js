import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, firestore, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', (e) => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = e => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    $('#modaleFile').modal('show')
    //if(typeof $('#modalFile').modal === "function")$('#modaleFile').modal('show')
  }

  // not need to cover this function by tests

  getBills = () => {
    const userEmail = localStorage.getItem('user') ?
      JSON.parse(localStorage.getItem('user')).email : ""
    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        console.log(snapshot.docs.length)
        let bills = snapshot.docs
          .sort((a, b) => {
            //console.log('a.data().date : ' + a.data().date + ', b.data().date : ' + b.data().date)
            return new Date(a.data().date) - new Date(b.data().date)}
            ) // Trie les données par leur entrée "date", des plus anciennes aux plus récentes
          .map(doc => {
            try {
              return {
                ...doc.data(),
                //date: formatDate(doc.data().date),
                date: doc.data().date, // Inversion avec la ligne 58, pour résoudre le console.log de la ligne 54
                status: formatStatus(doc.data().status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc.data())
              return {
                ...doc.data(),
                //date: doc.data().date,
                date: formatDate(doc.data().date),
                status: formatStatus(doc.data().status)
              }
            }
          })
          .filter(bill => bill.email === userEmail)
        return bills
      })
      .catch(error => error)
    }
  }
}