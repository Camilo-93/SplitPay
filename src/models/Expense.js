/**
 * Modelo de Gasto
 */
export class Expense {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.groupId
   * @param {string} params.description
   * @param {number} params.amount
   * @param {string} params.category - 'comida' | 'transporte' | 'casa' | 'ocio'
   * @param {string} params.paidById - ID del integrante que pagó
   * @param {Array<string>} params.splitWithIds - IDs de los participantes que dividen el gasto
   * @param {string} [params.receiptImage] - URI o base64 de la foto de la boleta/recibo
   * @param {Object} [params.location] - { latitude, longitude, address }
   * @param {string} [params.date] - Fecha ISO
   */
  constructor({
    id,
    groupId,
    description,
    amount,
    category = 'comida',
    paidById,
    splitWithIds = [],
    receiptImage = null,
    location = null,
    date = new Date().toISOString(),
  }) {
    this.id = id || String(Date.now());
    this.groupId = groupId;
    this.description = description ? description.trim() : '';
    this.amount = Number(amount) || 0;
    this.category = category;
    this.paidById = paidById;
    this.splitWithIds = splitWithIds;
    this.receiptImage = receiptImage;
    this.location = location;
    this.date = date;
  }

  static fromJSON(json) {
    return new Expense(json);
  }

  toJSON() {
    return {
      id: this.id,
      groupId: this.groupId,
      description: this.description,
      amount: this.amount,
      category: this.category,
      paidById: this.paidById,
      splitWithIds: this.splitWithIds,
      receiptImage: this.receiptImage,
      location: this.location,
      date: this.date,
    };
  }
}
