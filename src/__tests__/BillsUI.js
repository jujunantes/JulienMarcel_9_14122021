import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"

describe('When I am on Bills and it is loading', () => {
    test('Then, Loading page should be rendered', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
})

describe('When I am on Bills page but there is an error',()=>{
    test('Then, Error page should be rendered', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })
})