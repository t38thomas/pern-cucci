# Cucci Language — Documentazione Completa

> Cucci è un linguaggio interpretato minimalista ed esoterico scritto in TypeScript.  
> Ogni programma è una sequenza di righe, ognuna delle quali è una singola istruzione.

---

## Indice

1. [Installazione](#1-installazione)
2. [Utilizzo della CLI](#2-utilizzo-della-cli)
3. [Concetti fondamentali](#3-concetti-fondamentali)
4. [Sintassi](#4-sintassi)
   - [Assegnamento](#41-assegnamento)
   - [Definizione di funzioni](#42-definizione-di-funzioni)
   - [Chiamata di funzioni](#43-chiamata-di-funzioni)
   - [Espressioni e operatori](#44-espressioni-e-operatori)
   - [Stringhe](#45-stringhe)
   - [Stampa a schermo](#46-stampa-a-schermo)
   - [Parentesi](#47-parentesi)
5. [Regole del linguaggio](#5-regole-del-linguaggio)
6. [Esempi](#6-esempi)
7. [Errori comuni](#7-errori-comuni)

---

## 1. Installazione

### Prerequisiti

- **Node.js** v20 o superiore → https://nodejs.org
- **npm** (incluso con Node.js)

### Passi

```bash
# 1. Clona o scarica il progetto
git clone <url-del-repo>
cd pern-cucci

# 2. Installa le dipendenze
npm install

# 3. Compila i sorgenti TypeScript
npm run build
```

Dopo la compilazione, la CLI è disponibile tramite `node bin/pern.js` oppure tramite il comando `pern` se il pacchetto è installato globalmente.

### Installazione globale (opzionale)

```bash
npm link
```

Permette di eseguire `pern <file.cucci>` da qualsiasi cartella.

---

## 2. Utilizzo della CLI

```bash
node bin/pern.js <file.cucci>
```

Oppure, dopo `npm link`:

```bash
pern <file.cucci>
```

### Esempio

```bash
pern main.cucci
```

Il file deve avere estensione `.cucci`. La CLI legge il file riga per riga e lo esegue in modo interpretato.

---

## 3. Concetti fondamentali

| Caratteristica | Descrizione |
|---|---|
| **Identificatori** | Sempre un solo carattere: `A`, `x`, `f`, `3`, ecc. |
| **Nessuno spazio semantico** | Gli spazi vengono ignorati. La sintassi è guidata dal contesto. |
| **Una istruzione per riga** | Ogni riga è un'istruzione atomica. Le righe vuote sono vietate. |
| **Parser scannerless** | Non c'è fase di tokenizzazione. Il parser usa l'ambiente per disambiguare i simboli. |
| **Scope globale** | Le variabili sono globali e immutabili una volta definite. |
| **Scope locale** | I parametri di funzione vivono in uno scope locale durante l'esecuzione. |
| **Overloading per arità** | La stessa lettera può essere funzione con diversi numeri di parametri. |
| **Tipi impliciti** | Numeri (`number`) e stringhe (`string`). Nessuna dichiarazione esplicita. |

---

## 4. Sintassi

### 4.1 Assegnamento

La sintassi è: `<variabile><espressione>`

Il primo carattere della riga è il nome della variabile di destinazione; tutto il resto è l'espressione da valutare.

```cucci
A5
B10
CA+B
```

> Una variabile può essere definita **una sola volta**. Ridefinirla genera un errore a runtime.

### 4.2 Definizione di funzioni

La sintassi è: `$<nome><parametri>:<corpo>`

- `$` è il prefisso obbligatorio per le definizioni di funzione.
- `<nome>`: un carattere (la lettera che identifica la funzione).
- `<parametri>`: zero o più caratteri (ognuno è un parametro locale).
- `:`: separatore tra firma e corpo.
- `<corpo>`: un'espressione.

```cucci
$f:42
$gxy:x*y
$hxyz:(x+y)*z
```

| Definizione | Significato |
|---|---|
| `$f:42` | `f()` non ha parametri e ritorna `42` |
| `$gxy:x*y` | `g(x,y)` ritorna `x * y` |
| `$hxyz:(x+y)*z` | `h(x,y,z)` ritorna `(x+y) * z` |

**Overloading per arità**: è possibile definire la stessa lettera con diverso numero di parametri:

```cucci
$f:1
$fx:x+10
$fxy:x+y
```

Le tre definizioni coesistono e vengono disambiguate dal numero di argomenti forniti.

### 4.3 Chiamata di funzioni

Le funzioni vengono chiamate usando il nome seguito dagli argomenti **senza parentesi né virgole**. Il parser risolve greedily quanti argomenti consumare basandosi sull'arità registrata.

```cucci
$gxy:x*y
Ag23
```

Il parser vede `g` (funzione con 2 parametri), quindi consuma i successivi due valori `2` e `3`.  
Risultato: `A = g(2, 3) = 6`.

Per forzare una chiamata esplicita con parentesi:

```cucci
Ag(2)3
```

Utile per distinguere ambiguità tra argomenti.

### 4.4 Espressioni e operatori

#### Operatori aritmetici

| Operatore | Significato | Esempio | Risultato |
|---|---|---|---|
| `+` | Addizione (o concatenazione stringhe) | `3+4` | `7` |
| `-` | Sottrazione | `10-3` | `7` |
| `*` | Moltiplicazione | `3*4` | `12` |
| `/` | Divisione | `10/4` | `2.5` |
| `%` | Modulo | `10%3` | `1` |

> **Nota su `+`**: se uno dei due operandi è una stringa, il risultato è la concatenazione.

> **Nota su `*`**: se il lato sinistro vale `0`, il lato destro non viene valutato (ottimizzazione cortocircuito).

#### Operatori di confronto

Ritornano `1` (vero) o `0` (falso).

| Operatore | Significato | Esempio | Risultato |
|---|---|---|---|
| `<` | Minore | `3<5` | `1` |
| `>` | Maggiore | `3>5` | `0` |
| `=` | Uguaglianza (numeri e stringhe) | `3=3` | `1` |

#### Operatori unari

| Operatore | Posizione | Significato | Esempio | Risultato |
|---|---|---|---|---|
| `-` | Prefisso | Negazione numerica | `-5` | `-5` |
| `!` | Prefisso | NOT logico | `!0` | `1`, `!5` → `0` |
| `.` | Prefisso | Stampa e ritorna il valore | `.A` | Stampa `A`, restituisce `A` |

#### Precedenza degli operatori (dalla più alta)

1. Unari: `-`, `!`, `.`
2. Moltiplicativi: `*`, `/`, `%`
3. Additivi: `+`, `-`
4. Comparazione: `<`, `>`, `=`

### 4.5 Stringhe

Cucci non ha virgolette o delimitatori espliciti per le stringhe. Una sequenza di caratteri che non è né un operatore né un identificatore definito nell'ambiente viene interpretata come stringa letterale.

```cucci
xHelloWorld
.x
```

Output: `HelloWorld`

Le stringhe si concatenano con `+`:

```cucci
xHello
yWorld
zx+y
.z
```

Output: `HelloWorld`

> La stringa letterale termina non appena il parser incontra un carattere che fa parte dell'ambiente (variabile o funzione) o un operatore.

### 4.6 Stampa a schermo

L'operatore `.` (punto) è un operatore unario prefisso che:
1. Valuta l'operando.
2. Stampa il risultato su `stdout`.
3. Ritorna il valore stampato (può essere usato in espressioni).

```cucci
A7
.A
B.A+3
```

Riga 2: stampa `7`.  
Riga 3: stampa `7` (come side-effect di `.A`) poi assegna `10` a `B`.

### 4.7 Parentesi

Le parentesi `(` e `)` raggruppano le sub-espressioni e hanno la precedenza massima.

```cucci
A(3+4)*2
```

`A = (3+4)*2 = 14`

```cucci
$fn:(n=0)+(n>0)*(n*f(n-1))
```

Le parentesi sono indispensabili per la ricorsione e per rompere la gerarchia di precedenza.

---

## 5. Regole del linguaggio

1. **Un carattere per identificatore**: variabili e funzioni hanno sempre nomi di un singolo carattere.
2. **Righe vuote vietate**: ogni riga deve contenere esattamente un'istruzione. Le righe vuote causano un errore di sintassi.
3. **Immutabilità delle variabili**: una variabile globale può essere assegnata **una sola volta**.
4. **Nessun overloading di funzioni per stessa arità**: definire `$gxy:...` due volte genera un errore.
5. **Scope locale per i parametri**: i parametri di funzione sono locali e non modificano le variabili globali.
6. **Risoluzione dinamica dei simboli**: il parser usa l'ambiente runtime per capire se un carattere è una variabile, una funzione, un numero o una stringa. L'ordine di definizione conta.
7. **Ricorsione**: le funzioni possono richiamare se stesse. Il limite di profondità dello stack è **500 chiamate**.
8. **Tipi impliciti**: il tipo di un valore è determinato dal contesto (numero o stringa). La conversione è automatica dove possibile.

---

## 6. Esempi

### Hello World

```cucci
.HelloWorld
```

### Assegnamento e stampa

```cucci
A42
.A
```

Output: `42`

### Operazioni aritmetiche

```cucci
A10
B3
CA+B
DA*B
EA%B
.C
.D
.E
```

Output:
```
13
30
1
```

### Funzione fattoriale

```cucci
$fn:(n=0)+(n>0)*(n*f(n-1))
.f5
```

Output: `120`

**Spiegazione**:
- `(n=0)` ritorna `1` se `n` è zero (caso base).
- `(n>0)*(n*f(n-1))` ritorna `n * f(n-1)` se `n > 0`, oppure `0` grazie al cortocircuito di `*`.
- I due addendi si sommano: se `n=0` → `1+0=1`; se `n>0` → `0 + n*f(n-1)`.

### Funzione con overloading

```cucci
$f:100
$fx:x*2
$fxy:x+y
.f
.f5
.f35
```

Output:
```
100
10
8
```

### Fibonacci

```cucci
$fn:(n<2)*n+(n>1)*(f(n-1)+f(n-2))
.f10
```

Output: `55`

### Somma di due numeri con print inline

```cucci
A8
B4
.A+B
```

Output: `12`

### Connessione stringa + numero

```cucci
pRisultato:
A21
.p+A
```

Output: `Risultato:21`

---

## 7. Errori comuni

| Errore | Tipo | Causa | Soluzione |
|---|---|---|---|
| `Empty lines violate the Cucci specification.` | SyntaxError | Riga vuota nel file | Rimuovere le righe vuote |
| `Variable 'X' is already defined.` | RuntimeError | Ri-assegnamento di una variabile globale | Le variabili sono immutabili; usare un nome diverso |
| `Function 'f' with N parameters already exists.` | RuntimeError | Due funzioni con stesso nome e stessa arità | Cambiare arità o usare un nome diverso |
| `Assignment to variable 'X' lacks an expression.` | SyntaxError | Riga con solo una variabile, nessun valore | Aggiungere l'espressione dopo il nome |
| `Maximum call stack size exceeded in function 'f'.` | RuntimeError | Ricorsione infinita o troppo profonda (>500) | Verificare il caso base della funzione ricorsiva |
| `Symbol 'X' nonexistent or uninitialized.` | RuntimeError | Uso di una variabile non ancora definita | Definire la variabile prima di usarla |
| `Invalid numeric conversion from 'X'.` | RuntimeError | Operazione matematica su una stringa non numerica | Verificare i tipi dei valori utilizzati |
| `Missing closing parenthesis ')'.` | SyntaxError | Parentesi aperta non chiusa | Bilanciare le parentesi |
| `Source file must have .cucci extension.` | Fatal | File con estensione sbagliata | Rinominare il file con `.cucci` |
