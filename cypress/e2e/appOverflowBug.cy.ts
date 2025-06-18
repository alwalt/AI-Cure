/// <reference types="cypress" />
import "cypress-file-upload";

describe("LeftColumn overflow audit", () => {
  beforeEach(() => {
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
      .selectFile("cypress/fixtures/overflowBugDoc.xlsx", {
        force: true,
      })
      .should(($input) => {
        const input = $input[0] as HTMLInputElement;
        expect(input.files?.[0].name).to.equal("overflowBugDoc.xlsx");
      });
    // Click the actual Upload Files button inside the dialog
    cy.get('[data-cy="upload-submit"]', { timeout: 10000 })
      .should("be.visible")
      .click();
  });

  it("should have no elements with scrollHeight > clientHeight", () => {
    // Target the root container
    cy.get("[data-cy=root-app]")
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
  it("should have no elements with scrollHeight > clientHeight and will give DOM path", () => {
    cy.get("[data-cy=root-app]")
      .find("*")
      .each(($el, index) => {
        cy.wrap($el).then((el) => {
          const dom = el[0] as HTMLElement;
          if (dom.scrollHeight > dom.clientHeight) {
            // 1) Build a simple CSS‐selector path to this element:
            const getDomPath = (node: HTMLElement): string => {
              const stack: string[] = [];
              let el: HTMLElement | null = node;
              while (el && el.nodeType === Node.ELEMENT_NODE) {
                let sibIndex = 0;
                let sibCount = 0;
                const tagName = el.nodeName.toLowerCase();
                // count siblings of same type
                Array.from(el.parentNode?.children || []).forEach((sib) => {
                  if (sib.nodeName.toLowerCase() === tagName) {
                    sibCount += 1;
                  }
                });
                if (sibCount > 1) {
                  // if multiple siblings, find this one’s index
                  sibIndex = Array.from(el.parentNode?.children || [])
                    .filter((sib) => sib.nodeName.toLowerCase() === tagName)
                    .indexOf(el);
                  stack.unshift(`${tagName}:nth-of-type(${sibIndex + 1})`);
                } else {
                  stack.unshift(tagName);
                }
                el = el.parentElement;
              }
              // drop the html/root entry
              return stack.slice(1).join(" > ");
            };

            const path = getDomPath(dom);
            const snippet =
              dom.outerHTML.slice(0, 100).replace(/\s+/g, " ") + "...";

            Cypress.log({
              name: "overflow",
              message: `#${index} <${dom.tagName.toLowerCase()}> ${path}`,
              consoleProps: () => ({
                scrollHeight: dom.scrollHeight,
                clientHeight: dom.clientHeight,
                path,
                snippet,
                element: dom,
              }),
            });
          }
        });
      });
  });
});
