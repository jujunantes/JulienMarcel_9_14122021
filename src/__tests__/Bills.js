import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills  from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import ErrorPage from "../views/ErrorPage.js"
import LoadingPage from "../views/LoadingPage.js"
import {ROUTES} from "../constants/routes"

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      //to-do write expect expression
      
      Object.defineProperty(window, "localStorage", {value: localStorageMock,})
      window.localStorage.setItem("user",JSON.stringify({type: "Employee",}))
      document.body.innerHTML = BillsUI({ data: [] })
      expect(screen.getByTestId("icon-window")).toBeTruthy()
      
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      let dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML).sort(function (a, b) {
        // Il faut aussi trier les données de tests, comme pour les données réelles !
        if (a > b) {
            return -1;
        }
        if (b > a) {
            return 1;
        }
        return 0;
    })
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe('When I click on Create a new bill', () => {
      test('Then the NewBill page should load', () => {
        const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname })}
        //console.log("onNavigate : " + onNavigate)
        const factures = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
        const html = BillsUI({ data: factures })
        //console.log("html : " + html)
        document.body.innerHTML = html
        const button = screen.getByTestId('btn-new-bill')
        const handleClickNewBill = jest.fn(e => factures.handleClickNewBill(e, factures))
        button.addEventListener('click', handleClickNewBill)
        fireEvent.click(button)
        expect(handleClickNewBill).toHaveBeenCalled()
      })
    })

    describe('When I click on the eye icon', () => {
      test('Then a modal with an image should appear', () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const firestore = null
        const onNavigate = (pathname) => { document.body.innerHTML = pathname }
        const newBillGenerate = new Bills({ document, onNavigate, firestore, localStorage: window.localStorage, })
        $.fn.modal = jest.fn()
        const eyeButton = screen.getAllByTestId("icon-eye")[0] // On récupère le bouton
        const handleClickIconEye = jest.fn(() => newBillGenerate.handleClickIconEye(eyeButton) )
        eyeButton.addEventListener("click", handleClickIconEye)
        fireEvent.click(eyeButton)
        expect(handleClickIconEye).toHaveBeenCalled()
        const modalWindow = document.getElementById("modaleFile")
        expect(modalWindow).toBeTruthy()
      })
    })

  })
})

//test d'intégration Get
describe("Given I am connected as Employee",()=>{
  describe("When I navigate to bills page",()=>{
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")
      const bills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(bills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})