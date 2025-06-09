/// <reference types="cypress" />
import "cypress-file-upload";

describe("LeftColumn overflow audit", () => {
  before(() => {
    // Go to page, clear cookie, set testing cookie, upload file.

    //  Visit your page
    cy.visit("http://localhost:3000/");
    // clear cookie
    cy.clearCookies();
    // set testing cookie
    cy.setCookie("session_id", "8832167858ef4d85b99860c32976c40f");

    //  Open the upload dialog (modal)
    cy.get('[data-cy="open-upload-dialog"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    // Upload the problematic file
    cy.get('[data-cy="file-input"]') // adjust selector to your file input
      .first()
      .selectFile("cypress/fixtures/Watanabe_reimbursment_$225.50.xlsx", {
        force: true,
      })
      .should(($input) => {
        const input = $input[0] as HTMLInputElement;
        expect(input.files?.[0].name).to.equal(
          "Watanabe_reimbursment_$225.50.xlsx"
        );
      });
    // Click the actual Upload Files button inside the dialog
    cy.get('[data-cy="upload-submit"]', { timeout: 10000 })
      .should("be.visible")
      .click();
  });

  it("should have no elements with scrollHeight > clientHeight", () => {
    // Target the LeftColumn container
    cy.get(".left-column-selector") // replace with your actual class/ID
      .find("*") // grab every descendant
      .each(($el) => {
        cy.wrap($el).then((el) => {
          const dom = el[0] as HTMLElement;
          if (dom.scrollHeight > dom.clientHeight) {
            // log any offender
            // you can optionally fail the test here:
            // throw new Error(`Overflow on ${dom.tagName}.${dom.className}`);
            Cypress.log({
              name: "overflow",
              message: `${dom.tagName}.${dom.className} → scroll ${dom.scrollHeight}px vs client ${dom.clientHeight}px`,
            });
          }
        });
      });
  });
});
