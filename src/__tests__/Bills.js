import { screen, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills  from "../containers/Bills.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import ErrorPage from "../views/ErrorPage.js"
import LoadingPage from "../views/LoadingPage.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes"
/*
import Router from "../app/Router.js"
import Firestore from "../app/Firestore.js"
import Router from "../app/Router.js"
*/

jest.mock("../views/LoadingPage.js", () => { // https://jestjs.io/fr/docs/jest-object
  const monModule = jest.requireActual("../views/LoadingPage.js")
  return { __esModule: true, ...monModule, default: jest.fn(() => "LoadingPage"), }
})

jest.mock("../views/ErrorPage.js", () => {
  const monModule = jest.requireActual("../views/ErrorPage.js")
  return { __esModule: true, ...monModule, default: jest.fn(() => "ErrorPage"), }
})

const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname })}

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
    test("then the loading page is displayed when loading is true", () => {
      const html = BillsUI({ data: bills, loading: true })
      document.body.innerHTML = html
      expect(LoadingPage).toHaveBeenCalled()
    })
    test("then the Error page is displayed when loading is false", () => {
      const html = BillsUI({ data: bills, loading: false, error: true })
      document.body.innerHTML = html
      expect(ErrorPage).toHaveBeenCalled()
    })

    describe('When I click on Create a new bill', () => {
      test('Then the NewBill page should load', () => {
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
      it('Then a modal with an image should appear', () => {
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