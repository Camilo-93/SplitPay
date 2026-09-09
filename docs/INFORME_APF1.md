# PROYECTO FINAL — DESARROLLO DE APLICACIONES MÓVILES (100000ST91)
## INFORME TÉCNICO Y DE REQUERIMIENTOS — PRIMER AVANCE (APF1)

---

# SplitPay
### *Gestión inteligente de gastos compartidos — Aplicación móvil multiplataforma en React Native*

---

## 1. DESCRIPCIÓN DE LA APLICACIÓN

En convivencias estudiantiles, viajes grupales, salidas con amigos o proyectos universitarios, una persona suele asumir pagos generales (comida, hospedaje, transporte, servicios del departamento, insumos). El cálculo manual de **quién le debe a quién**, el riesgo de cobros duplicados y la incomodidad de cuadrar cuentas mediante hojas de cálculo o chats generan desorden y posibles malentendidos.

**SplitPay** es una aplicación móvil desarrollada en **React Native con Expo**, concebida para la gestión inteligente de finanzas compartidas. Permite:
1. **Crear grupos temáticos de gastos** (ej. *"Depa Universitario"*, *"Viaje de Fin de Ciclo"*, *"Pichanga de los Viernes"*).
2. **Registrar gastos individuales o compartidos**, indicando quién realizó el pago, la categoría del gasto (Comida, Transporte, Casa, Ocio), los participantes que asumen la cuota y adjuntar opcionalmente la foto del comprobante de pago (boleta/recibo) y la ubicación geográfica del gasto.
3. **Calcular en tiempo real el balance neto** de cada integrante:
   $$\text{Balance Neto} = \text{Dinero Pagado} - \text{Dinero que corresponde asumir}$$
   - Balance $> 0$: Le deben dinero al usuario (estado verde / acreedor).
   - Balance $< 0$: El usuario debe dinero (estado rojo / deudor).
   - Balance $= 0$: Cuenta equilibrada.
4. **Sugerir transferencias mínimas óptimas** para liquidar todas las deudas con la menor cantidad posible de transacciones, integrando métodos de pago locales como **Yape, Plin y Efectivo**.

---

## 2. OBJETIVOS DEL PROYECTO

### 2.1 Objetivo General
Desarrollar una aplicación móvil multiplataforma (Android/iOS) con React Native y Expo que permita organizar, dividir y liquidar gastos compartidos en grupos de manera automatizada, transparente y sin requerir conexión a internet obligatoria (Offline-First).

### 2.2 Objetivos Específicos
1. **Diseñar e implementar una interfaz de usuario moderna y responsiva** utilizando componentes nativos de React Native (`View`, `Text`, `Image`, `TextInput`, `TouchableOpacity`, `FlatList`) con `StyleSheet` y Flexbox.
2. **Estructurar la navegación por pantallas** mediante React Navigation, combinando un `Stack Navigator` para el flujo principal con un `Tab Navigator` para la visualización de gastos y balances.
3. **Implementar una arquitectura de estado desacoplada** basada en React Context API (`ExpenseContext`, `ThemeContext`) y Custom Hooks (`useExpenses`, `useBalances`).
4. **Desarrollar el algoritmo de liquidación mínima de deudas (Greedy Algorithm)** que reduce drásticamente el número de transferencias bancarias requeridas entre los miembros.
5. **Garantizar la persistencia de datos local** a través de `AsyncStorage` (`storageService.js`) y el consumo de servicios REST públicos (`apiService.js`) para la obtención dinámica de avatares.
6. **Integrar funciones de hardware y sensores del dispositivo móvil**, como acceso a la cámara y galería (`expo-image-picker`), geolocalización (`expo-location`) y notificaciones locales (`expo-notifications`).

---

## 3. HISTORIAS DE USUARIO (HU) Y CRITERIOS DE ACEPTACIÓN

### HU-01: Creación y Gestión de Grupos de Gastos
- **Como** usuario organizador,
- **Quiero** crear grupos temáticos asignándoles un nombre, descripción, ícono representativo e integrantes,
- **Para** mantener separados los gastos de diferentes eventos o convivencias.
- **Criterios de Aceptación:**
  - *Dado* que el usuario presiona el botón flotante "+", *cuando* ingresa el nombre del grupo y selecciona un ícono, *entonces* el grupo se guarda en `AsyncStorage` y aparece en el Dashboard.
  - *Dado* que se añaden integrantes, *cuando* se escribe su nombre, *entonces* la app consulta la API RandomUser para asignarle un avatar dinámico.

### HU-02: Registro de Gastos con Comprobante y Ubicación
- **Como** participante del grupo,
- **Quiero** registrar un nuevo gasto indicando monto en soles (`S/.`), concepto, pagador, categoría y quiénes dividen el gasto,
- **Para** que la aplicación divida equitativamente la cuota correspondiente.
- **Criterios de Aceptación:**
  - *Dado* que el usuario llena el formulario, *cuando* el monto es $> 0$ y hay al menos un participante, *entonces* se habilita el botón "Guardar Gasto".
  - *Dado* que el usuario desea adjuntar una boleta, *cuando* presiona "Adjuntar Recibo", *entonces* se solicita permiso de cámara/galería y se adjunta la imagen.

### HU-03: Visualización de Balances y Estado Financiero
- **Como** integrante de un grupo,
- **Quiero** consultar en tiempo real mi balance neto (si debo o me deben) y el detalle de cada compañero,
- **Para** tener claridad y transparencia sobre el estado de las cuentas.
- **Criterios de Aceptación:**
  - *Dado* que existen gastos en el grupo, *cuando* el usuario abre la pestaña "Balances", *entonces* se muestra una tarjeta por miembro con lo pagado, lo debido y un badge de color (verde si $> 0$, rojo si $< 0$).

### HU-04: Liquidación Óptima de Deudas (Yape / Plin / Efectivo)
- **Como** deudor o acreedor,
- **Quiero** ver las transferencias directas sugeridas y registrar pagos,
- **Para** saldar las deudas con la menor cantidad de transferencias posibles.
- **Criterios de Aceptación:**
  - *Dado* que hay diferencias en los balances, *cuando* el usuario entra a "Liquidar Cuentas", *entonces* el sistema muestra el flujo "$A \rightarrow B: S/. XX.XX$".
  - *Dado* que se presiona "Marcar Saldado", *cuando* se elige el método (Yape, Plin o Efectivo), *entonces* se registra la liquidación y las deudas quedan saldadas.

### HU-05: Soporte de Tema Claro y Oscuro
- **Como** usuario con preferencias visuales,
- **Quiero** alternar entre Modo Claro y Modo Oscuro,
- **Para** una visualización cómoda en cualquier condición de luz.

---

## 4. SUSTENTACIÓN TÉCNICA Y MAPEO DE CONCEPTOS DEL CURSO

A continuación se detalla cómo se aplican los conceptos solicitados en la rúbrica del curso dentro del código fuente de **SplitPay**:

| Concepto de la Rúbrica | Implementación en React Native (SplitPay) | Archivo de Código |
| :--- | :--- | :--- |
| **Anclaje / Layouts** | Flexbox (`flexDirection`, `justifyContent`, `alignItems`, `padding`, `margin`) y maquetado fluido. | `src/screens/*.js`, `src/components/*.js` |
| **Botón y "onClick"** | `TouchableOpacity` y `Pressable` con `onPress` y animaciones de retroalimentación táctil (`activeOpacity`). | `src/components/GroupCard.js`, `AddExpenseScreen.js` |
| **Estilos Básicos** | `StyleSheet.create` con diseño glassmorphism, esquinas redondeadas (`borderRadius: 20`), sombras y badges. | `src/context/ThemeContext.js`, componentes |
| **Activity y Menús** | React Navigation: `Stack Navigator` (`AppNavigator.js`) con cabeceras y `Tab Navigator` ("Gastos" y "Balances"). | `src/navigation/AppNavigator.js`, `GroupDetailScreen.js` |
| **ListView** | `FlatList` con `keyExtractor`, renderizado optimizado por filas y `ListEmptyComponent`. | `src/screens/DashboardScreen.js`, `GroupDetailScreen.js` |
| **Ciclo de Vida** | Hook `useEffect` (equivalente a `onCreate`, actualizaciones y `onDestroy`) y listener de `AppState` (`onResume`, `onPause`, `onStop`). | `App.js`, `src/hooks/useExpenses.js` |

### Demostración del Ciclo de Vida en Código (`App.js`):
```javascript
useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // Equivalente a onResume()
    } else if (nextAppState === 'background') {
      // Equivalente a onPause() / onStop()
    }
  };
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription.remove(); // Equivalente a onDestroy()
}, []);
```

---

## 5. BENEFICIOS DE LA APLICACIÓN

1. **Ahorro de Tiempo y Esfuerzo**: Elimina cálculos manuales complejos en hojas de cálculo o chats grupales.
2. **Minimización de Transacciones Bancarias**: Si Juan le debe a Pedro S/. 20 y Pedro le debe a María S/. 20, SplitPay sugiere directamente una sola transferencia de Juan a María, evitando comisiones o transferencias intermedias.
3. **Transparencia Total**: Cada integrante puede visualizar la boleta/recibo adjunto y el lugar donde se realizó la compra.
4. **Disponibilidad Offline (Sin Internet)**: Al usar `AsyncStorage`, la aplicación puede utilizarse en viajes a lugares remotos sin cobertura celular.

---

## 6. CONCLUSIONES

1. **SplitPay** cumple integralmente con los requerimientos técnicos del sílabo (Unidades 1 a 4) y los criterios de evaluación del **Primer Avance (APF1)**.
2. La arquitectura basada en componentes, Custom Hooks (`useExpenses`, `useBalances`) y Context API garantiza una alta cohesión, bajo acoplamiento y facilidad de mantenimiento.
3. La aplicación ofrece una experiencia de usuario (UI/UX) moderna, rápida e intuitiva adaptada al contexto peruano (moneda en Soles `S/.`, Yape y Plin).
