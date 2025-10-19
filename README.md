# Nebula GX

Un navigateur Electron stylé, inspiré des interfaces gamers (Opera GX, Perplexity, etc.) avec un écran d'accueil néon et des raccourcis personnalisés.

## Fonctionnalités

- Thème sombre futuriste avec effets néon et UI glassmorphism
- Barre d'adresse intelligente (URL directe ou recherche Google)
- Navigation complète : retour, avant, rechargement, accueil
- Raccourcis latéraux et widgets d'accueil interactifs
- Webview embarqué permettant de naviguer sur n'importe quel site
- Contrôles de fenêtre personnalisés (réduire, agrandir, fermer)

## Démarrage

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer l'application :
   ```bash
   npm start
   ```

> ℹ️ Electron n'est pas pré-installé dans ce dépôt. L'étape `npm install` est obligatoire avant le premier lancement.

## Structure

```
├── main.js          # Processus principal Electron
├── preload.js       # Bridge sécurisé entre main et renderer
├── src/
│   ├── index.html   # UI principale (toolbar, home screen, webview)
│   ├── renderer.js  # Logique de navigation côté renderer
│   └── styles.css   # Thème et styles néon
└── package.json     # Dépendances et scripts
```

## Personnalisation rapide

- Ajoute/modifie les boutons avec `data-url` pour créer tes propres raccourcis.
- Mets à jour les palettes de couleurs dans `styles.css` (`:root` variables) pour changer l'ambiance.
- Ajuste le comportement de la barre d'adresse dans `renderer.js` (fonction `toNavigableURL`).

Profite d'un navigateur personnalisable, moderne et rapide à prendre en main !
