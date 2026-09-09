# 💸 SplitPay — Gestión Inteligente de Gastos Compartidos

> **Proyecto del Curso**: Desarrollo de Aplicaciones Móviles (100000ST91)  
> **Plataforma**: React Native con Expo (JavaScript)  
> **Arquitectura**: Basada en Componentes, React Context API, Custom Hooks y Persistencia Local (AsyncStorage).

---

## 📱 Descripción del Proyecto

**SplitPay** es una aplicación móvil multiplataforma que simplifica la división de gastos en grupos (convivencia estudiantil, viajes, salidas con amigos o pichangas). Calcula automáticamente el balance neto individual de cada participante y determina la menor cantidad de transferencias bancarias necesarias para saldar deudas (con soporte para moneda en Soles `S/.`, Yape, Plin y Efectivo).

---

## 🚀 Características Principales (MVP)

- **🏢 Grupos Temáticos**: Creación y administración de grupos de gastos con íconos personalizados y avatares dinámicos vía API pública.
- **🧾 Registro de Gastos**: Formulario intuitivo con selección de pagador, participantes, categorías (Comida 🍕, Transporte 🚕, Casa 🏠, Ocio 🍻), adjunto de foto de recibo (cámara/galería) y ubicación GPS opcional.
- **⚖️ Balances en Tiempo Real**: Tarjeta superior dinámica en el Dashboard (verde si te deben, roja si debes) y desglose individual por miembro en cada grupo.
- **🤝 Liquidación Óptima (Settle Up)**: Algoritmo que calcula el número mínimo de pagos sugeridos y permite marcar deudas como saldadas.
- **🌙 Modo Claro / Modo Oscuro**: Theming dinámico integrado con persistencia de preferencias.
- **📶 Offline-First**: Toda la información se almacena localmente en el dispositivo con `AsyncStorage`.

---

## 🛠️ Tecnologías y Librerías

- **Framework**: React Native / Expo (`~52.0.x`)
- **Navegación**: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`
- **Persistencia**: `@react-native-async-storage/async-storage`
- **Hardware y Sensores**: `expo-image-picker`, `expo-location`, `expo-notifications`
- **API Externa**: Consumo REST a RandomUser API para avatares
- **Estilos**: `StyleSheet` nativo + Flexbox

---

## 📂 Estructura del Código

```text
SplitPay/
├── App.js                         # Entrada principal, NavigationContainer y AppState
├── app.json                       # Configuración de Expo y permisos nativos
├── package.json                   # Dependencias y scripts del proyecto
├── docs/
│   ├── INFORME_APF1.md            # Informe académico formal para el entregable
│   └── GUIA_EXPOSICION_10MIN.md   # Guion estructurado para la exposición de 10 min
└── src/
    ├── models/                    # Modelos de datos (Expense, Group, Member)
    ├── utils/                     # Formateo de moneda (S/.) y categorías
    ├── services/                  # AsyncStorage, API REST y Notificaciones
    ├── context/                   # Contextos globales (ExpenseContext, ThemeContext)
    ├── hooks/                     # Hooks personalizados (useExpenses, useBalances)
    ├── components/                # Componentes UI reutilizables
    ├── screens/                   # Pantallas principales (Dashboard, GroupDetail, AddExpense, SettleUp)
    └── navigation/                # Configuración de rutas (AppNavigator)
```

---

## ⚙️ Instrucciones de Instalación y Ejecución

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Camilo-93/SplitPay.git
cd SplitPay
npm install
```

### 2. Iniciar el servidor de desarrollo de Expo
```bash
npx expo start
```
- **Dispositivo Físico**: Escanea el código QR desde la app **Expo Go** (Android o iOS).
- **Emulador Android**: Presiona `a` en la consola.
- **Simulador iOS**: Presiona `i` en la consola.
- **Versión Web**: Presiona `w` en la consola.

---

## 📄 Documentación del Proyecto
- [Informe Técnico APF1](file:///c:/Users/User/Desktop/SplitPay/docs/INFORME_APF1.md)
- [Guía de Arquitectura y Flujo de Pantallas](file:///c:/Users/User/Desktop/SplitPay/docs/ARQUITECTURA_Y_FLUJOS.md)
- [Guía de Exposición de 10 Minutos](file:///c:/Users/User/Desktop/SplitPay/docs/GUIA_EXPOSICION_10MIN.md)