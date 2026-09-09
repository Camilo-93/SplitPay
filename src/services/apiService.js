/**
 * Servicio para consumo de API REST pública externa
 * 
 * Cumple con el requisito de la Unidad 2 del sílabo:
 * "Consumo de APIs REST (fetch/axios): apiService.js obtiene avatares
 *  de los integrantes desde una API pública (ej. RandomUser API)"
 */

const RANDOM_USER_API_URL = 'https://randomuser.me/api/';

export const apiService = {
  /**
   * Obtiene usuarios/avatares aleatorios de la API pública RandomUser
   * @param {number} count - Cantidad de usuarios
   * @returns {Promise<Array<{ name: string, email: string, phone: string, avatarUrl: string }>>}
   */
  async getRandomUsers(count = 1) {
    try {
      const response = await fetch(
        `${RANDOM_USER_API_URL}?results=${count}&nat=es,us,br&inc=name,picture,email,phone`
      );

      if (!response.ok) {
        throw new Error(`Error en llamada API RandomUser: status ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((u) => ({
        name: `${u.name.first} ${u.name.last}`,
        email: u.email,
        phone: u.phone,
        avatarUrl: u.picture.medium || u.picture.thumbnail,
      }));
    } catch (error) {
      console.warn('[apiService] Error al consumir RandomUser API, usando fallback offline:', error.message);
      // Fallback offline seguro para que la app siempre funcione aunque no haya internet
      return Array.from({ length: count }).map((_, idx) => {
        const dummyNames = ['Carlos Mendoza', 'Andrea Silva', 'Mateo Castro', 'Gabriela Ruiz', 'Rodrigo Vega'];
        const name = dummyNames[idx % dummyNames.length];
        return {
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@correo.com`,
          phone: `9${Math.floor(10000000 + Math.random() * 90000000)}`,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`,
        };
      });
    }
  },

  /**
   * Obtiene un avatar aleatorio único
   */
  async getRandomAvatar(nameHint = 'User') {
    try {
      const users = await this.getRandomUsers(1);
      if (users && users.length > 0) {
        return users[0].avatarUrl;
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameHint)}&background=3b82f6&color=fff`;
    } catch (error) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameHint)}&background=3b82f6&color=fff`;
    }
  },
};
