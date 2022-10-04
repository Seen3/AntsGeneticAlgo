let population;
let lifespan = 800;
let lifeP;
let count = 0;
let target;
let maxforce=0.2;

let rx=300;
let ry=350;
let rw=200;
let rh=10;



function setup() {
    createCanvas(800, 600);
    rocket = new Rocket();
    population = new Population();
    lifeP = createP();
    target = createVector(width / 2, 50);
}
function draw() {
    background(0);
    population.run();
    lifeP.html(count);
    count++;

    if (count == lifespan) {
        population.evaluate();
        population.selection();
        count = 0;
    }
    fill(255);
    rect(rx,ry,rw,rh);
    ellipse(target.x, target.y, 16, 16);
}


function Population() {
    this.rockets = [];
    this.popsize = 25;
    this.matingpool = [];
    for (let i = 0; i < this.popsize; i++) {
        this.rockets[i] = new Rocket();
    }

    this.evaluate = () => {
        let maxfit = 0;
        for (let i = 0; i < this.popsize; i++) {
            this.rockets[i].calcFitness();
            if (this.rockets[i].fitness > maxfit) {
                maxfit = this.rockets[i].fitness;
            }
        }
        for (let i = 0; i < this.popsize; i++) {
            this.rockets[i].fitness /= maxfit;
        }
        this.matingpool = [];
        for (let i = 0; i < this.popsize; i++) {
            let n = this.rockets[i].fitness * 100;
            for (let j = 0; j < n; j++) {
                this.matingpool.push(this.rockets[i]);
            }
        }
    }
    this.selection = () => {
        let newRockets = [];
        for (let i = 0; i < this.rockets.length; i++) {
            let parentA = random(this.matingpool).dna;
            let parentB = random(this.matingpool).dna;
            let child = parentA.crossover(parentB);
            child.mutation();
            newRockets[i] = new Rocket(child);
        }
        this.rockets = newRockets;

    }


    this.run = () => {
        for (let i = 0; i < this.popsize; i++) {
            this.rockets[i].update();
            this.rockets[i].show();
        }
    }
}

function DNA(genes) {
    if (genes) {
        this.genes = genes;
    }
    else {
        this.genes = [];
        for (let i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(maxforce);
        }
    }
    this.crossover = (partner) => {
        let newdna = [];
        let mid = floor(random(this.genes.length));
        for (let i = 0; i < this.genes.length; i++) {
            if (i > mid) {
                newdna[i] = this.genes[i];
            }
            else {
                newdna[i] = partner.genes[i];
            }
        }

        return new DNA(newdna);
    }
    this.mutation=()=>{
        for(let i=0;i<this.genes.length;i++)
        {
            if (random(1)<0.01)
            {
                this.genes[i]=p5.Vector.random2D();
                this.genes[i].setMag(maxforce);
            }
        }
    }
}


function Rocket(dna) {
    this.pos = createVector(width / 2, height);
    this.vel = createVector();
    this.acc = createVector();
    this.completed=false;
    this.crashed=false;
    this.collisiontime=0;
    if (dna) {
        this.dna = dna;
    }
    else {

        this.dna = new DNA();
    }
    this.fitness = 0;

    this.applyForce = (force) => {
        this.acc.add(force);
    }

    this.calcFitness = () => {
        let d = dist(this.pos.x, this.pos.y, target.x, target.y);
        console.log(count);
        this.fitness = map(d, 0, width, width, 0);
        if (this.completed)
        {
            this.fitness*=(1000*this.collisiontime);
        }
        else if(this.crashed){
            this.fitness/=100;
            this.collisiontime*=10;
            this.fitness*=this.collisiontime*1/d;
        }
    };
    this.update = function () {

        let d=dist(this.pos.x, this.pos.y, target.x, target.y);
        if (d<10)
        {
            this.completed=true;
            this.collisiontime=count/lifespan;
            this.pos=target.copy();
        }
        if (this.pos.x>rx && this.pos.x<rx+rw && this.pos.y>ry && this.pos.y<ry+rh)
        {
            this.collisiontime=count/lifespan;
            this.crashed=true;
        }
        if(this.pos.x>width || this.pos.x<0)
        {
            this.collisiontime=count/lifespan;
            this.crashed=true;
        }
        if(this.pos.y>height || this.pos.y<0)
        {
            this.collisiontime=count/lifespan;
            this.crashed=true;
        }
        this.applyForce(this.dna.genes[count]);
        if(!this.completed && !this.crashed){
        
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.vel.limit(4);
        }
    }

    this.show = function () {
        push();
        noStroke();
        fill(255, 150);
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());
        rectMode(CENTER);
        rect(0, 0, 25, 5);
        pop();
    }
}
