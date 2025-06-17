/// <reference types="cypress" />

describe('example to-do app', () => {
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
        cy.contains('Google').click()
        cy.contains('GitHub').click()

        cy.contains('Sign Up').click()
        cy.contains('Google').click()
        cy.contains('GitHub').click()
    })


})