/**
 * Modelo de Miembro / Integrante de Grupo
 */
export class Member {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string} [params.email]
   * @param {string} [params.phone]
   * @param {string} [params.avatarUrl]
   */
  constructor({ id, name, email = '', phone = '', avatarUrl = '' }) {
    this.id = id || String(Date.now() + Math.random().toString(36).substring(2, 7));
    this.name = name.trim();
    this.email = email.trim();
    this.phone = phone.trim();
    this.avatarUrl = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=10b981&color=fff`;
  }

  static fromJSON(json) {
    return new Member(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      avatarUrl: this.avatarUrl,
    };
  }
}
