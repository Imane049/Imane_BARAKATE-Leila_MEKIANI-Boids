  // Flocking
  // Daniel Shiffman
  // https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
  // https://youtu.be/mhjuuHl6qHM

  class Boid {
    static debug = false;
    constructor(x, y, image) {

      this.pos = createVector(x, y);

      this.vel = p5.Vector.random2D();
      this.vel.setMag(random(2, 4));
      this.acc = createVector();
      this.maxForce = 0.2;
      this.maxSpeed = 5;
      this.r = 6;

      this.rayonZoneDeFreinage = 100;

      // si le boid est une image
      if (image !== undefined) {
        this.image = image;

        // largeur image
        const li = this.image.width;
        // hauteur image
        const hi = this.image.height;
        // on remet les valeurs à l'échelle par rapport au rayon
        // du véhicule
        const ratio = li / hi;
        // la largeur de l'image sera égale à r
        this.imageL = this.r;
        // la hauteur de l'image sera égale à r/ratio
        this.imageH = this.r / ratio;
      }

      this.perceptionRadius = 25;
      // pour le comportement align
      this.alignWeight = 1.5;
      // pour le comportement cohesion
      this.cohesionWeight = 1;
      // Pour la séparation
      this.separationWeight = 2;
      // Pour le confinement
      this.boundariesX = 0;
      this.boundariesY = 0
      this.boundariesWidth = width;
      this.boundariesHeight = height;
      this.boundariesDistance = 25;

      this.boundariesWeight = 10;

      // Wander
      // pour comportement wander
      this.distanceCercle = 150;
      this.wanderRadius = 50;
      this.wanderTheta = 0;
      this.displaceRange = 0.1;
    }

    // Equivalent de "applyBehaviors" dans le code des autres exemples
    // flock signifie "se rassembler" en anglais
    flock(boids) {
      let alignment = this.align(boids);
      let cohesion = this.cohesion(boids);
      let separation = this.separation(boids);
      let boundaries = this.boundaries(this.boundariesX, this.boundariesY, this.boundariesWidth, this.boundariesHeight, this.boundariesDistance);
      //let boundaries = this.boundaries(100, 200, 800, 400, 25);

      alignment.mult(this.alignWeight);
      cohesion.mult(this.cohesionWeight);
      separation.mult(this.separationWeight);
      boundaries.mult(this.boundariesWeight);

      this.applyForce(alignment);                   
      this.applyForce(cohesion);
      this.applyForce(separation);
      this.applyForce(boundaries);
    }

    align(boids) {
      let perceptionRadius = this.perceptionRadius;

      let steering = createVector();
      let total = 0;
      for (let other of boids) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.vel);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    seek(target, arrival = false, d = 10) {
      let force = p5.Vector.sub(target, this.pos);
      let desiredSpeed = this.maxSpeed;
    
      if (arrival) {
        let distance = force.mag();
        if (distance < this.rayonZoneDeFreinage) {
          desiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
        }
      }
    
      force.setMag(desiredSpeed);
      force.sub(this.vel);
      force.limit(this.maxForce);
      return force;
    }
    
    flee(target) {
      return this.seek(target).mult(-1);
    }

    separation(boids) {
      let perceptionRadius = this.perceptionRadius;

      let steering = createVector();
      let total = 0;

      for (let other of boids) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (other != this && d < perceptionRadius) {
          let diff = p5.Vector.sub(this.pos, other.pos);
          diff.div(d * d);
          steering.add(diff);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }

    cohesion(boids) {
      let perceptionRadius = 2 * this.perceptionRadius;

      let steering = createVector();
      let total = 0;

      for (let other of boids) {
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (other != this && d < perceptionRadius) {
          steering.add(other.pos);
          total++;
        }
      }
      if (total > 0) {
        steering.div(total);

        steering.sub(this.pos);
        steering.setMag(this.maxSpeed);
        steering.sub(this.vel);
        steering.limit(this.maxForce);
      }
      return steering;
    }
    avoid(obstacles) {
      let ahead = this.vel.copy().mult(30); 
      let ahead2 = ahead.copy().mult(0.5); 


      let pointAhead = this.pos.copy().add(ahead);
      let pointAhead2 = this.pos.copy().add(ahead2);

      let closestObstacle = this.getObstacleLePlusProche(obstacles);

      if (!closestObstacle) return createVector(0, 0);

      let distance1 = pointAhead.dist(closestObstacle.pos);
      let distance2 = pointAhead2.dist(closestObstacle.pos);
      let distance = min(distance1, distance2);

    

      stroke(100, 100);
      strokeWeight(this.largeurZoneEvitementDevantVaisseau);
      line(this.pos.x, this.pos.y, pointAhead.x, pointAhead.y);

      if (distance < closestObstacle.r + this.largeurZoneEvitementDevantVaisseau + this.r) {
        let force;
        if (distance1 < distance2) {
          force = p5.Vector.sub(pointAhead, closestObstacle.pos);
        } else {
          force = p5.Vector.sub(pointAhead2, closestObstacle.pos);
        }

        force.setMag(this.maxSpeed);
        force.sub(this.vel);
        force.limit(this.maxForce);
        return force;
      }

      return createVector(0, 0);
    }
    getObstacleLePlusProche(obstacles) {
      let closestObstacle = null;
      let minDistance = Infinity; // Start with a very large value
    
      for (const obstacle of obstacles) {
        // Calculate the distance between the boid and the obstacle
        const distance = this.pos.dist(obstacle.pos);
    
        // Update the closest obstacle if this one is closer
        if (distance < minDistance) {
          minDistance = distance;
          closestObstacle = obstacle;
        }
      }
    
      return closestObstacle;
    }
    

    // seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
    seek(target) {
      // on calcule la direction vers la cible
      // C'est l'ETAPE 1 (action : se diriger vers une cible)
      let vitesseSouhaitee = p5.Vector.sub(target, this.pos);

      // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
      // on limite ce vecteur à la longueur maxSpeed
      vitesseSouhaitee.setMag(this.maxSpeed);

      // on calcule maintenant force = desiredSpeed - currentSpeed
      let force = p5.Vector.sub(vitesseSouhaitee, this.vel);

      // et on limite cette force à maxForce
      force.limit(this.maxForce);
      return force;
    }

    flee(target) {
      // inverse de seek ! 
      let force = this.seek(target).mult(-1);
      return force;
    }

    fleeWithTargetRadius(target) {
      const d = this.pos.dist(target);
      if (d < target.r + 10) {
        // je fuis la cible, on réutilise le comportement flee
        const fleeForce = this.flee(target);
        fleeForce.mult(100);
        this.applyForce(fleeForce);
      }
    }
    
    fleeObstaclesWithTargetRadius(obstacles) {
      // Iterate through each obstacle
      for (let obstacle of obstacles) {
        // Calculate the distance between the boid and the obstacle
        const d = this.pos.dist(obstacle.pos);
    
        // Check if the boid is within the obstacle's radius plus some margin
        if (d < obstacle.r + this.r + 10) {
          // Calculate the flee force and apply it
          const fleeForce = this.flee(obstacle.pos);
          fleeForce.mult(100); // Adjust the multiplier for stronger fleeing
          this.applyForce(fleeForce);
        }
      }
    }
    
    wander() {
      // point devant le véhicule, centre du cercle

      let centreCercleDevant = this.vel.copy();
      centreCercleDevant.setMag(this.distanceCercle);
      centreCercleDevant.add(this.pos);

      if (Boid.debug) {
        // on le dessine sous la forme d'une petit cercle rouge
        fill("red");
        circle(centreCercleDevant.x, centreCercleDevant.y, 8);

        // Cercle autour du point
        noFill();
        stroke("white");
        circle(centreCercleDevant.x, centreCercleDevant.y, this.wanderRadius * 2);

        // on dessine une ligne qui relie le vaisseau à ce point
        // c'est la ligne blanche en face du vaisseau
        line(this.pos.x, this.pos.y, centreCercleDevant.x, centreCercleDevant.y);
      }

      // On va s'occuper de calculer le point vert SUR LE CERCLE
      // il fait un angle wanderTheta avec le centre du cercle
      // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
      // + cet angle
      let wanderAngle = this.vel.heading() + this.wanderTheta;
      // on calcule les coordonnées du point vert
      let pointSurCercle = createVector(this.wanderRadius * cos(wanderAngle), this.wanderRadius * sin(wanderAngle));
      // on ajoute la position du vaisseau
      pointSurCercle.add(centreCercleDevant);

      // maintenant pointSurCercle c'est un point sur le cercle
      // on le dessine sous la forme d'un cercle vert
      if (Boid.debug) {
        fill("lightGreen");
        circle(pointSurCercle.x, pointSurCercle.y, 8);

        // on dessine une ligne qui va du vaisseau vers le point sur le 
        // cercle
        line(this.pos.x, this.pos.y, pointSurCercle.x, pointSurCercle.y);

      }
      // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
      let desiredSpeed = p5.Vector.sub(pointSurCercle, this.pos);


      // On a donc la vitesse désirée que l'on cherche qui est le vecteur
      // allant du vaisseau au cercle vert. On le calcule :
      // ci-dessous, steer c'est la desiredSpeed directement !
      // Voir l'article de Craig Reynolds, Daniel Shiffman s'est trompé
      // dans sa vidéo, on ne calcule pas la formule classique
      // force = desiredSpeed - vitesseCourante, mais ici on a directement
      // force = desiredSpeed
      let force = p5.Vector.sub(desiredSpeed, this.vel);
      force.setMag(this.maxForce);

      // On déplace le point vert sur le cerlcle (en radians)
      this.wanderTheta += random(-this.displaceRange, this.displaceRange);

      return force;
    }

    // Permet de rester dans les limites d'une zone rectangulaire.
    // Lorsque le véhicule s'approche d'un bord vertical ou horizontal
    // on calcule la vitesse désirée dans la direction "réfléchie" par
    // rapport au bord (comme au billard).
    // Par exemple, si le véhicule s'approche du bord gauche à moins de 
    // 25 pixels (valeur par défaut de la variable d),
    // on calcule la vitesse désirée en gardant le x du vecteur vitesse
    // et en mettant son y positif. x vaut maxSpeed et y vaut avant une valeur
    // négative (puisque le véhicule va vers la gauche), on lui donne un y positif
    // ça c'est pour la direction à prendre (vitesse désirée). Une fois la direction
    // calculée on lui donne une norme égale à maxSpeed, puis on calcule la force
    // normalement : force = vitesseDesiree - vitesseActuelle
    // paramètres = un rectangle (bx, by, bw, bh) et une distance d
    boundaries(bx, by, bw, bh, d) {
      let vitesseDesiree = null;

      const xBordGauche = bx + d;
      const xBordDroite = bx + bw - d;
      const yBordHaut = by + d;
      const yBordBas = by + bh - d;

      // si le véhicule est trop à gauche ou trop à droite
      if (this.pos.x < xBordGauche) {
        // 
        vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
      } else if (this.pos.x > xBordDroite) {
        vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
      }

      if (this.pos.y < yBordHaut) {
        vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
      } else if (this.pos.y > yBordBas) {
        vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
      }

      if (vitesseDesiree !== null) {
        vitesseDesiree.setMag(this.maxSpeed);
        const force = p5.Vector.sub(vitesseDesiree, this.vel);
        vitesseDesiree.limit(this.maxForce);
        return vitesseDesiree;
      }

      if (Boid.debug) {
        // dessin du cadre de la zone
        push();

        noFill();
        stroke("white");
        rect(bx, by, bw, bh);

        // et du rectangle intérieur avec une bordure rouge de d pixels
        stroke("red");
        rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);

        pop();
      }

      // si on est pas près du bord (vitesse désirée nulle), on renvoie un vecteur nul
      return createVector(0, 0);
    }

    getVehiculeLePlusProche(vehicules) {
      let plusPetiteDistance = Infinity;
      let vehiculeLePlusProche;

      vehicules.forEach(v => {
        if (v != this) {
          // Je calcule la distance entre le vaisseau et le vehicule
          const distance = this.pos.dist(v.pos);
          if (distance < plusPetiteDistance) {
            plusPetiteDistance = distance;
            vehiculeLePlusProche = v;
          }
        }
      });

      return vehiculeLePlusProche;
    }


    applyForce(force) {
      this.acc.add(force);
    }

    update() {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.acc.mult(0);
    }

    show(rotateFlag = true) {
      if (this.image !== undefined) {
        imageMode(CENTER);

        // On regarde la direction dans laquelle le boid va :
        push();
        translate(this.pos.x, this.pos.y);

        // J'ai rajouté PI car l'image était à l'envers
        if (rotateFlag){rotate(this.vel.heading() + Math.PI);}
        
        image(this.image, 0, 0, this.r, this.r);

        pop();

        return;
      } else {
        strokeWeight(this.r);
        stroke(255);
        point(this.pos.x, this.pos.y);
      }
    }

    edges() {
    const margin = 10; // distance from the edge to start the change in direction

    // Check if the boid is near the right edge
    if (this.pos.x > width - margin) {
      this.vel.x = -abs(this.vel.x); // Reverse the x-velocity
    }
    // Check if the boid is near the left edge
    else if (this.pos.x < margin) {
      this.vel.x = abs(this.vel.x); // Reverse the x-velocity
    }
    
    // Check if the boid is near the bottom edge
    if (this.pos.y > height - margin) {
      this.vel.y = -abs(this.vel.y); // Reverse the y-velocity
    }
    // Check if the boid is near the top edge
    else if (this.pos.y < margin) {
      this.vel.y = abs(this.vel.y); // Reverse the y-velocity
    }
  }

    

  }

  class Obstacle {
    constructor(x, y, r) {
      this.pos = createVector(x, y);
      this.r = r;
      this.image = loadImage("assets/coralReef.png");
      this.offset = random(0, TWO_PI); 
      this.floatSpeed = random(0.01, 0.05); 
      this.floatRange = random(5, 15); 
    }

    show() {
      let floatY = this.floatRange * sin(frameCount * this.floatSpeed + this.offset);
      push();
      imageMode(CENTER);
      // let imageWidth , imageHeight = random(100, 200);
      image(this.image, this.pos.x, this.pos.y + floatY, 200, 200);
      pop();
    }
  }
