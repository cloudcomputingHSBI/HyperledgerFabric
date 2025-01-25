Initialisieren des Node.js-Projekts:
npm init -y

TypeScript und Abhängigkeiten installieren:
npm install --save fabric-shim fabric-contract-api
npm install --save-dev typescript @types/node

TypeScript-Compiler konfigurieren:
npx tsc --init

tsconfig.json Anpassen, um die kompilierten Dateien in ein dist-Verzeichnis zu schreiben:
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}

Build- und Start-Skripte hinzufügen, um den Code zu kompilieren und für Fabric bereitzustellen:
"scripts": {
  "build": "tsc",
  "start": "fabric-shim start"
}

Chaincode kompilieren:
npm run build

Deployen auf Hyperledger Fabric:
-ccn ist der Name des Chaincodes.
-ccp ist der Pfad zum Chaincode-Verzeichnis.
-ccl gibt die Sprache an.
./network.sh deployCC -ccn myChaincode -ccp ~/HyperledgerFabric/Chaincode -ccl typescript
