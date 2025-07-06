// @ts-nocheck

describe('Transaction forms smoke test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('switches tabs and shows broker form', () => {
    cy.contains('Broker').click();
    cy.contains('Paynow Transfer').should('be.visible');
  });

  it('fills broker form (happy path, no submit)', () => {
    cy.contains('Broker').click();

    cy.get('input[placeholder="123,45"]').first().type('100,00');
    cy.get('input[placeholder="123,45"]').eq(1).type('50,00');
    // assume DateInput uses native input type=date
    cy.get('input[type="date"]').eq(0).clear().type('2025-07-06');
    cy.get('input[type="date"]').eq(1).clear().type('2025-07-05');
  });
}); 