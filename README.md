# Installateur NumWorks pour Android

Application web installable depuis Chrome Android. Elle reprend la liste du programme PC : ajout de fichiers `.nwa` et des émulateurs du catalogue, association des ROM/données, réorganisation, conservation locale et import/export des presets `.nwpreset` compatibles.

## Installation et connexion USB

1. Hébergez le contenu de ce dossier sur une adresse HTTPS.
2. Ouvrez cette adresse dans Chrome Android et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».
3. Branchez la NumWorks avec un câble USB de données (et un adaptateur OTG si nécessaire), puis allumez-la.
4. Dans l’application, appuyez sur « Connecter la calculatrice » et choisissez l’appareil NumWorks.
5. Vérifiez/assemblez la liste, puis appuyez sur « Installer toute la liste en un flash ».

L’opération remplace toute la zone « applications externes » par la liste affichée, comme sur PC. Ajoutez donc aussi les applis que vous souhaitez conserver. Une vérification sans calculatrice télécharge l’image assemblée `.bin`.

Le navigateur doit prendre en charge WebUSB. Une connexion Internet est nécessaire pour les fichiers du catalogue ; les fichiers choisis et presets importés sont gardés dans le stockage privé du navigateur.

## Moteur d’assemblage

`nwlink` 0.0.19 est utilisé pour le même assemblage WebAssembly et le même protocole USB que dans le programme PC. `build-nwlink-web.mjs` génère la variante navigateur à partir de la distribution npm locale et place les modules WebAssembly dans `nwlink/package/dist/toolchain/`.
