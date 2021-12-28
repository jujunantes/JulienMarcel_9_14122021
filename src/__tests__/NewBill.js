import "@testing-library/jest-dom"
import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import {ROUTES} from "../constants/routes"
import firebase from "../__mocks__/firebase"
import BillsUI from "../views/BillsUI"

jest.mock("../app/Firestore")
const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }) }

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("and...", () => {
      test("then ... handleChangeFile", () => {
        const jsdomAlert = window.alert  // remember the jsdom alert (https://stackoverflow.com/questions/55088482/jest-not-implemented-window-alert)
        window.alert = () => {};  // provide an empty implementation for window.alert
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'johndoe@email.com' }))
        const obj = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })
        const handleChangeFile = jest.fn(obj.handleChangeFile)
        const fichierSoumis = screen.getByTestId("file")
        fichierSoumis.addEventListener("input", handleChangeFile)
        fireEvent.input(fichierSoumis, "test.png")
        expect(handleChangeFile).toHaveBeenCalled()
        window.alert = jsdomAlert;  // restore the jsdom alert
      })
    })

    describe("and...", () => {
      test("then... handleSubmit", () => {
        document.body.innerHTML = NewBillUI()
        Object.defineProperty(window, 'localStorage', { value: localStorageMock})
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'johndoe@email.com' }))
        const obj = new NewBill({ document, onNavigate, firestore: null, localStorage: window.localStorage })
        const handleSubmit = jest.fn(obj.handleSubmit)
        const factureEnvoyee = screen.getByTestId('form-new-bill')
        factureEnvoyee.addEventListener("submit", handleSubmit)
        fireEvent.submit(factureEnvoyee)
        expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})

// test d'intégration POST
describe("Given I am a user connected as an Employee", () => {
  describe("When I submit a new bill", () => {
    test("then POST bill to mock through the API", async () => {
      const postSpy = jest.spyOn(firebase,"post")
      const newBill = {
        "id": "qcCK3SzECmaZAGRrHjadF",
        "status": "refused",
        "pct": 20,
        "amount": 200,
        "email": "a@a",
        "name": "test2",
        "vat": "40",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2002-02-02",
        "commentAdmin": "pas la bonne facture",
        "commentary": "test2",
        "type": "Restaurants et bars",
        "fileUrl": "https://google.com"
      }
      const bills = await firebase.post(newBill)
      expect(postSpy).toHaveBeenCalled()
      expect(bills.data.length).toBe(5)
    })
    test("Add bill through the API and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error:"Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("Add bill through the API and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})