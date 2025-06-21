/// <reference types="cypress" />

describe('events chatbot app', () => {
    beforeEach(() => {
        // Cypress starts out with a blank slate for each test
        // so we must tell it to visit our website with the `cy.visit()` command.
        // Since we want to visit the same URL at the start of all our tests,
        // we include it in our beforeEach function so that it runs before each test
        cy.visit('/', { failOnStatusCode: false }) // root defined in cypress.config.ts
    })

    it('redirects to /login', () => {
        cy.url().should('include', '/login');
    })

    it('can visit /signup and /login', () => {
        cy.contains('Sign Up').click()
        cy.url().should('include', '/signup')

        cy.contains('Sign In').click()
        cy.url().should('include', '/login')
    })

    it('has login options with google and github', () => {
        // no straightforward way to click and visit Google/GitHub OAuth
        // get 403 and cypress doesn't seem to be able to follow cross-origin navigation
        // on /login
        cy.contains('Google') //.click()
        cy.contains('GitHub') //.click()
        // on /signup
        cy.contains('Sign Up') //.click()
        cy.contains('Google') //.click()
        cy.contains('GitHub') //.click()
    })

    it('can create a new user and see appropriate start page', () => {
        // eventually may need a test db to store test users, chats separately from prod
        cy.contains('Sign Up').click()
        const rand = crypto.randomUUID()
        const email = `test-${rand}@email.com`
        cy.get('input[name="name"]').type(`test-${rand.slice(0, 5)}`)
        cy.get('input[name="email"]').type(email)
        const password = crypto.randomUUID()
        cy.get('input[name="password"]').type(password)

        cy.contains('Register').click()

        // check hello and start chatting is displayed
        cy.contains('h3', 'Hello')
        cy.contains('Start chatting').click()
        cy.contains('div', 'messages')

        // create new chat

        // log out

        // login
        // check start chatting and new chat is displayed
    })


})