(function(global) {
    global.JSWarrior = function JSWarrior() {
        var self = this;

        global.log = function(str) {
            console.log(str);
            $('.log-panel').append(
                $('<div/>').text(str)
            ).scrollTop(99999);

        };

        var numCells = 11
        var target = 0;
        var cells = [];
        for(var i=0; i<numCells; i++) {
            cells[i] = new Empty();
        }

        var level = new Level(numCells, cells);

        level.setCellContents(1, new Captive({
            name: 'captive',
            type: 'Captive',
            cell: 1,
            level: level
        }));

        level.setCellContents(2, new Enemy({
            name: 'enemy',
            type: 'Archer',
            attackType: 'ranged',
            range: 3,
            health: 10,
            cell: 2,
            level: level,
            attackDamage: 3,
            pivoted: true
        }));

        level.setCellContents(7, new Enemy({
            name: 'enemy',
            type: 'Thick Sludge',
            attackType: 'melee',
            health: 25,
            cell: 7,
            level: level,
            attackDamage: 5
        }));

        level.setCellContents(9, new Enemy({
            name: 'enemy',
            type: 'Wizard',
            attackType: 'ranged',
            range: 3,
            health: 3,
            cell: 9,
            level: level,
            attackDamage: 11
        }));

        level.setCellContents(10, new Captive({
            name: 'captive',
            type: 'Captive',
            cell: 10,
            level: level
        }));
        // level.setCellContents(7, new Enemy({
        //     name: 'enemy',
        //     type: 'Archer',
        //     attackType: 'ranged',
        //     range: 3,
        //     health: 10,
        //     cell: 7,
        //     level: level,
        //     attackDamage: 3
        // }));
        

        var warrior = new Warrior({
            level: level,
            currentCell: 5,
            health: 20,
            attackDamage: 5
        });

        window.jsWarrior = {};

        self.run = function(code) {
            $('.log-panel').empty();
            clearInterval(global.interval);
            
            
            
            (new Function(code))();    
            var turn = 0;
            global.interval = setInterval(function() {
                try {
                    log('turn ' + (turn + 1));
                    for(var i=0;i<level.cells.length; i++) {
                        var cell = level.cells[i];
                        if(cell.object.name === 'enemy') {
                            cell.object.playTurn();
                        }
                    }
                    if(warrior.health <= 0) {
                        clearInterval(interval);
                        log('jsWarrior died!');
                        log('jsWarrior failed this level!');
                        return;
                    }

                    jsWarrior.turn();
                    
                    turn++;
                    if(turn === 100) {
                        clearInterval(interval);
                        log('jsWarrior failed this level!');
                        return;
                    }
                    if(warrior.getCurrentCell() === target) {
                        log('Hurray you completed this level!');
                        clearInterval(interval);
                        return;
                    }
                } catch(exception) {
                    log(exception.toString());
                    log('jsWarrior failed this level!');
                    clearInterval(interval);
                }
            }, 100);
        };
    };

    function Captive(options) {
        var self = this;

        self.name = options.name;
        self.type = options.type;
        self.cell = options.cell;
        self.level = options.level;

        self.bound = true;

        self.free = function() {
            self.bound = false;
            log(options.type + ' is now free!');
            self.level.setCellContents(self.cell, new Empty());
        }

        self.hit = function() {
            log(options.type + ' died!');
            self.level.setCellContents(self.cell, new Empty());    
        }
    }

    function Enemy(options) {
        var self = this;

        self.name = options.name;
        self.type = options.type;
        self.attackType = options.attackType;
        self.range = options.range;
        self.cell = options.cell;
        self.health = options.health;
        self.level = options.level;
        self.attackDamage = options.attackDamage;
        self.firstAttack = true;
        self.pivoted = options.pivoted;

        self.hit = function(damage) {
            self.health -= damage;
            
            if(self.health <= 0) {
                log(self.type + ' died!');
                self.level.setCellContents(self.cell, new Empty());
            }
        }

        self.playTurn = function() {
            if(self.attackType === 'melee') {
                var obj; 
                if(self.pivoted) {
                    obj = self.level.getCellContents(self.cell + 1).object;
                    
                } else {
                    obj = self.level.getCellContents(self.cell - 1).object;
                }
                if(obj.name === 'warrior') {
                    if(!self.firstAttack) {
                        obj.hit(self.attackDamage);
                        log(self.type + ' hits jsWarrior and deals ' + self.attackDamage + ' damage!');
                    } else {
                        self.firstAttack = false;
                    }       
                }
            } else if(self.attackType === 'ranged') {

                var canAttack = true;
                var warrior = null;
                var cells = [];
                for(var i=0; i<self.range; i++) {

                    if(self.pivoted) {
                        cells[i] = self.level.getCellContents(self.cell + (i+1)).object;
                    } else {
                        cells[i] = self.level.getCellContents(self.cell - (i+1)).object;    
                    }
                    if(cells[i].name !== 'empty' && cells[i].name !== 'warrior') {
                        canAttack = false;
                    }
                    if(cells[i].name === 'warrior') {
                        warrior =  cells[i];
                    }
                }

                if(canAttack && warrior) {

                    if(!self.firstAttack) {
                        warrior.hit(self.attackDamage);
                        log(self.type + ' hits jsWarrior and deals ' + self.attackDamage + ' damage!');    
                    }
                    self.firstAttack = false;
                } else {
                    self.firstAttack = true;
                }

            }       
        }
    }

    function Cell(object) {
        var self = this;

        self.object = object;
    }

    function Level(num, lvl) {
        var self = this;
        self.numCells = num;
        self.cells = [];

        for(var i=0; i<num; i++) {
            self.cells.push(new Cell(lvl[i]));
        }

        self.getCellContents = function(index) {
            return self.cells[index];
        }

        self.setCellContents = function(index, obj) {
            self.cells[index] = new Cell(obj);
        }
    }

    function Empty() {
        this.name = 'empty';
    }

    function Warrior(options) {
        var self = this;

        self.level = options.level;
        self.currentCell = options.currentCell;
        self.health = options.health;
        self.attackDamage = options.attackDamage;
        self.name = 'warrior';
        self.moveVar = 1;
        self.level.setCellContents(self.currentCell, self);
        self.walk = function(direction) {
            
            if(direction === 'forward' || direction == undefined) {
                if(self.level.getCellContents(self.currentCell + self.moveVar).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell += self.moveVar;
                    self.level.setCellContents(self.currentCell, self);
                    
                    log('Walking to next cell! currentCell is ' + self.currentCell);
                    return true
                }    
            } else if(direction === 'backward') {
                if(self.level.getCellContents(self.currentCell - self.moveVar).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell -= self.moveVar
                    self.level.setCellContents(self.currentCell, self);
                    
                    log('Walking to next cell! currentCell is ' + self.currentCell);
                    return true
                }
            }
            
            log('Cannot walk to next cell!');
            return false;
        }

        self.check = function(direction) {
            var numCells = self.level.numCells;
            if(self.currentCell + self.moveVar >= numCells || self.currentCell + self.moveVar < 0) {
                return 'wall';
            }
            if(direction === 'forward' || direction === undefined) {
                return self.level.getCellContents(self.currentCell + self.moveVar).object.name;    
            } else if(direction === 'backward') {
                return self.level.getCellContents(self.currentCell - self.moveVar).object.name;    
            }
            
        }

        self.attack = function(direction) {
            var obj;
            if(direction === 'forward' || direction === undefined) {
                obj = self.level.getCellContents(self.currentCell + self.moveVar).object    
            } else if(direction === 'backward') {
                obj = self.level.getCellContents(self.currentCell - self.moveVar).object    
            }
            

            log('jsWarrior attempts to attack!');
            if(obj.name === 'enemy' || obj.name === 'captive') {
                log('jsWarrior inflicted ' + self.attackDamage + ' damage to the ' + obj.type);
                obj.hit(self.attackDamage);
                
            } else {
                log('jsWarrior warrior hit nothing!');
            }
        }

        self.hit = function(damage) {
            self.health -= damage;
        }

        self.rest = function(damage) {
            log('jsWarrior rested and got 2 health!');
            self.health += 2;
            if(self.health > 20) {
                self.health = 20;
            }
        }

        self.rescue = function(direction) {

            var obj;
            if(direction === 'forward' || direction === undefined) {
                obj = self.level.getCellContents(self.currentCell + self.moveVar).object    
            } else if(direction === 'backward') {
                obj = self.level.getCellContents(self.currentCell - self.moveVar).object    
            }
            

            log('jsWarrior attempts to rescue!');
            if(obj.name === 'captive') {
                log('jsWarrior rescues ' + obj.type + ' !');
                obj.free();
            } else {
                log('jsWarrior rescues nothing!');
            }

        }

        self.look = function(direction) {
            var array = [];
            var numCells = self.level.numCells;
            var dir;
            if(direction === 'forward' || direction === undefined) {
                dir = 1;
            } else if(direction === 'backward'){
                dir = -1;
            }
            for(var i=0; i<3; i++) {
                var tCell = self.currentCell + ((i+1)*self.moveVar) * dir;
                if(tCell >= numCells || tCell < 0) {
                    array[i] = 'wall';
                    continue;
                }

                var obj = self.level.getCellContents(tCell).object;

                array[i] = obj.name;
            }
            return array;
        }

        self.shoot = function(direction) {
            var array = [];
            var numCells = self.level.numCells;
            var dir;
            log('jsWarrior shoots an arrow')

            if(direction === 'forward' || direction === undefined) {
                dir = 1;
            } else if(direction === 'backward') {
                dir = -1;
            }
            for(var i=0; i<3; i++) {
                var tCell = self.currentCell + ((i+1)*self.moveVar) * dir;
                if(tCell >= numCells || tCell < 0) {
                    log('arrow hits the wall!');
                    return;
                }

                var obj = self.level.getCellContents(tCell).object;

                if(obj.name === 'enemy' || obj.name === 'captive') {
                    log('jsWarrior inflicted 3 damage to the ' + obj.type);
                    obj.hit(3);
                    return;
                }
            }
            log('arrow hits nothing!!');
        }

        self.pivot = function() {
            log('jsWarrior turned!');
            self.moveVar *= -1;
        }

        self.getCurrentCell = function() {
            return self.currentCell;
        }
    }
})(window); 