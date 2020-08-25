let myGen = [
  [
    14,
    13,
    12,
    30
  ],
  [
    14,
    30,
    12,
    30
  ],
  [
    30,
    30,
    2,
    9
  ],
  [
    30,
    30,
    30,
    30
  ],
  [
    30,
    0,
    30,
    30
  ],
  [
    5,
    10,
    30,
    30
  ],
  [
    30,
    6,
    30,
    30
  ],
  [
    13,
    30,
    30,
    13
  ],
  [
    30,
    15,
    30,
    30
  ],
  [
    30,
    30,
    0,
    30
  ],
  [
    30,
    30,
    30,
    30
  ],
  [
    30,
    5,
    2,
    30
  ],
  [
    2,
    30,
    30,
    7
  ],
  [
    30,
    8,
    30,
    30
  ],
  [
    30,
    9,
    30,
    30
  ],
  [
    15,
    30,
    9,
    30
  ]
];

let methods = {
  pourEnergy(element) {
    let overlaps = 0;
    for (let level = element.y + 1; level <= document.querySelectorAll('tr').length; level++) {
      if (document.querySelector(`tr:nth-child(${level}) > th:nth-child(${element.x})`).children.length) {
        overlaps++;
        if (overlaps === 3) break;
      }
    }

    this.energy += (5 + element.y) * (3 - overlaps);
  },

  addSeed(x, y, activeGenom) {
    if (x > document.querySelectorAll(`tr:first-child > th`).length) x = 1;
    if (x < 1) x = document.querySelectorAll(`tr:first-child > th`).length;

    let targetCell = document.querySelector(`tr:nth-child(${y}) > th:nth-child(${x})`);
  
    if (y < 1 || y > 24
      || targetCell.children.length) {
        return;
    }
  
  
    let seed = {
      x,
      y,
      activeGenom,
      element: document.createElement('div'),
      energy: 0,
      __proto__: methods,
    };
    seed.element.style.background = '#fff'
  
    targetCell.append(seed.element);
    this.seeds.push(seed);
    this.partsCount++;
  }
}

function createTree(genom) {
  return {
    age: 0,
    energy: 300,
    partsCount: 0,
    woods: [],
    seeds: [],
    genom,
    inFall: true,
    color: `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`,
    __proto__: methods,
  };
}

function doStep() {
  for (let tree of [...trees]) {
    if (tree.inFall) {
      if (tree.seeds[0].y > 1) {
        let targetCell = document.querySelector(`tr:nth-child(${tree.seeds[0].y - 1}) > th:nth-child(${tree.seeds[0].x})`);
        if (!targetCell.children.length) {
          tree.seeds[0].y--
          targetCell.append(tree.seeds[0].element);
        } else {
          trees.splice(trees.indexOf(tree), 1);
          tree.seeds[0].element.remove();
        }

        continue
      } else {
        tree.inFall = false;
      }
    }

    for (let wood of tree.woods) {
      tree.pourEnergy(wood);
    }
    tree.energy -= tree.partsCount * 13;
  
    if (tree.energy < 0 || tree.age > 30) {
      for (let wood of tree.woods) {
        wood.element.remove();
      }
      trees.splice(trees.indexOf(tree), 1);
      
      for (let seed of tree.seeds) {
        seed.element.remove();

        let newGenom = tree.genom.map(gen => [...gen]);
        if (Math.random() > 0.75) {
          newGenom[Math.floor(Math.random() * 16)][Math.floor(Math.random() * 4)] = Math.floor(Math.random() * 31);
        }

        let newTree = createTree(newGenom);

        newTree.addSeed(seed.x, seed.y, newTree.genom[0]);
        newTree.seeds[0].pourEnergy(newTree.seeds[0]);
        trees.push(newTree);
      }
      continue;
    }
  
    for (let seed of [...tree.seeds]) {
      if (seed.energy < 18) continue;
  
      tree.woods.push(tree.seeds.splice(tree.seeds.indexOf(seed),1)[0]);
      seed.element.style.background = tree.color;
  
      if (seed.activeGenom[0] < 16) {
        tree.addSeed(seed.x - 1, seed.y, tree.genom[seed.activeGenom[0]]);
      }
    
      if (seed.activeGenom[1] < 16) {
        tree.addSeed(seed.x, seed.y + 1, tree.genom[seed.activeGenom[1]]);
      }
  
      if (seed.activeGenom[2] < 16) {
        tree.addSeed(seed.x + 1, seed.y, tree.genom[seed.activeGenom[2]]);
      }
  
      if (seed.activeGenom[3] < 16) {
        tree.addSeed(seed.x, seed.y - 1, tree.genom[seed.activeGenom[3]]);
      }
    }
  
    for (let seed of tree.seeds) {
      seed.pourEnergy(seed);
    }
  
    tree.age++
  }
};

let trees = [];

let startGenom = [];
for (let i = 0; i < 16; i++) {
  startGenom.push( [
    Math.floor(Math.random() * 31),
    Math.floor(Math.random() * 31),
    Math.floor(Math.random() * 31),
    Math.floor(Math.random() * 31)]);
}
trees.push(createTree(myGen));

trees[0].addSeed(32, 1, trees[0].genom[0]);
trees[0].seeds[0].pourEnergy(trees[0].seeds[0]);

let timer;
document.querySelector('table').onclick = () => {
  if (timer) {
    clearInterval(timer)
    timer = null;
    console.log(trees);
  } else {
    timer = setInterval(doStep, 10);
  }
}
