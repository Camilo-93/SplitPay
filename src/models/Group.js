/**
 * Modelo de Grupo de Gastos
 */
export class Group {
  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {string} [params.description]
   * @param {string} [params.icon]
   * @param {Array<Object>} [params.members]
   * @param {string} [params.createdAt]
   */
  constructor({
    id,
    name,
    description = '',
    icon = '👥',
    members = [],
    createdAt = new Date().toISOString(),
  }) {
    this.id = id || String(Date.now());
    this.name = name.trim();
    this.description = description.trim();
    this.icon = icon;
    this.members = members; // Array de Member o { id, name, avatarUrl }
    this.createdAt = createdAt;
  }

  static fromJSON(json) {
    return new Group(json);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      members: this.members,
      createdAt: this.createdAt,
    };
  }
}
