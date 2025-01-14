# Projet a : BOIDS

Cette application simule le comportement de "flocking" de créatures maritimes avec des interactions dynamiques. La simulation montre comment ces créatures se déplacent selon des principes de base du flocking (alignement, cohésion et séparation), l'évitement d'obstacles, et la poursuite d'une cible (comme la position de la souris).

---

## Fonctionnalités

- **Comportement de Flocking** :  
  Plusieurs créatures (boids, raies, tortues) se déplacent en groupe, en évitant les obstacles et en maintenant leur formation grâce aux principes du flocking.
  
- **Suivi de la Cible** :  
  Les créatures (raies, tortues, boids) suivent la position de la souris en tant que cible tout en évitant les obstacles et en interagissant entre elles.
  
- **Curseurs Interactifs** :  
  Contrôlez le comportement des créatures, comme l'alignement, la cohésion et la séparation à l'aide de curseurs.
  
- **Obstacles** :  
  Créez des obstacles dans la simulation en cliquant sur la fenêtre (avec la touche `o`).
  
- **Création de Poissons** :  
  Créez des poissons en cliquant et faisant glisser la souris.
  
- **Ajout de Requins** :  
  Ajoutez des requins à la simulation en ajustant le curseur pour définir le nombre de requins.
  
- **Raies et Tortues en File (comme un serpent)** :  
  Les raies et les tortues suivent la souris tout en formant une file (mouvement en serpent).

---

## Utilisation

### Création d'Obstacles

- Cliquez sur la fenêtre de la simulation tout en appuyant sur la touche `o` pour créer des obstacles que les créatures éviteront.

### Création de Poissons

- Cliquez et faites glisser la souris pour ajouter de nouveaux poissons dans la simulation. Les poissons suivent le mouvement de la souris.

### Ajout de Requins

- Utilisez le curseur **Nombre de requins** pour ajuster le nombre de requins dans la simulation. Ces requins auront un comportement de poursuite envers les poissons.

### Raies et Tortues en File

- Les raies et les tortues forment des files et suivent la souris. La première raie et la première tortue suivent la souris, tandis que les autres suivent respectivement la créature qui les précède, créant ainsi un effet de "serpent".

---

## Paramètres de Flocking

Vous pouvez ajuster le comportement du groupe de créatures à l'aide des curseurs :

- **Poids d'Alignement** : Contrôle l'alignement des créatures avec les autres.
  
- **Poids de Cohésion** : Contrôle la proximité des créatures entre elles.
  
- **Poids de Séparation** : Détermine la distance minimale à maintenir entre les créatures.

---


