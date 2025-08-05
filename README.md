# Hyperledger Fabric Demo – HSBI

Dieses Projekt demonstriert die Verwendung eines permissioned Blockchain-Netzwerks über **Hyperledger Fabric** mit Anwendungsbezug auf Wahlsysteme. 
Es wurde im Rahmen einer Lehrveranstaltung an der Hochschule Bielefeld (HSBI) im Modul **Cloud Computing** entwickelt.

---

## 📌 Ziel des Projekts

Das Ziel ist es, ein funktionierendes Hyperledger-Fabric-Netzwerk zu implementieren, das folgende Komponenten enthält:

- Ein konfiguriertes Netzwerk mit Peers, Orderern
- Einen anwendungsbezogenen Chaincode (Smart Contracts)
- Durchführung beispielhafter Transaktionen mit dem Netzwerk

## Anwendungsbezug
Die Blockchain-Netze wurden dazu verwendet, um Wahlen zu simulieren

## Transaktionen auf der Blockchain
- Erstellen von Wahlen
- Abstimmen in einer Wahl

## Andere Funktionen
- Abrufen der Wahlergebnisse aus dem Blockchain-Netz


## Projektstruktur

- Frontend
- Backend
- application-gateway-typescript/src:
  - Stellt Verbindung zur Blockchain her und interagiert mit dem Chaincode (Smart Contract)
  - Führt drei Hauptaktionen durch:
    Wahl erstellen
    Stimme abgeben
    Wahlergebnis abrufen (keine Transaktion, ändert den Ledger nicht)
- chaincode-typescript/src: Mithilfe der Fabric-Contract-API implementierter Chaincode (Smartcontract). Dieser Contract läuft auf den Peers innerhalb des Fabric-Netzwerks – alles, was hier passiert, wird in der Blockchain gespeichert und validiert.

