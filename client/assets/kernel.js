(function(global) {
    global.JSWarrior = function JSWarrior() {
        var self = this;

        global.log = function(str) {
            console.log(str);
            $('.log-panel').append(
                $('<div/>').text(str)
            ).scrollTop(99999);

        };

        var numCells = 6
        var target = 0;
        var cells = [];
        for(var i=0; i<numCells; i++) {
            cells[i] = new Empty();
        }

        var level = new Level(numCells, cells);

        level.setCellContents(0, new Captive({
            name: 'captive',
            type: 'Captive',
            cell: 0,
            level: level
        }));

        level.setCellContents(4, new Enemy({
            name: 'enemy',
            type: 'Thick Sludge',
            attackType: 'melee',
            health: 25,
            cell: 4,
            level: level,
            attackDamage: 3
        }));

        level.setCellContents(6, new Enemy({
            name: 'enemy',
            type: 'Archer',
            attackType: 'ranged',
            range: 3,
            health: 10,
            cell: 6,
            level: level,
            attackDamage: 3
        }));

        level.setCellContents(7, new Enemy({
            name: 'enemy',
            type: 'Archer',
            attackType: 'ranged',
            range: 3,
            health: 10,
            cell: 7,
            level: level,
            attackDamage: 3
        }));
        

        var warrior = new Warrior({
            level: level,
            currentCell: 2,
            health: 20,
            attackDamage: 5
        });

        var jsWarrior = {};

        self.run = function(code) {
            $('.log-panel').empty();
            clearInterval(global.interval);
            eval(code);
            try {
                var turn = 0;
                global.interval = setInterval(function() {
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
                }, 100);
            } catch(exception) {
                log('jsWarrior failed this level!');
            }
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

        self.hit = function(damage) {
            self.health -= damage;
            
            if(self.health <= 0) {
                log(self.type + ' died!');
                self.level.setCellContents(self.cell, new Empty());
            }
        }

        self.playTurn = function() {
            if(self.attackType === 'melee') {
                var obj = self.level.getCellContents(self.cell - 1).object;

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
                    cells[i] = self.level.getCellContents(self.cell - (i+1)).object;
                    
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

        self.level.setCellContents(self.currentCell, self);
        self.walk = function(direction) {
            if(!direction) {
                direction = 'forward';
            }
            if(direction === 'forward') {
                if(self.level.getCellContents(self.currentCell + 1).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell++;
                    self.level.setCellContents(self.currentCell, self);
                    
                    log('Walking to next cell! currentCell is ' + self.currentCell);
                    return true
                }    
            } else if(direction === 'backward') {
                if(self.level.getCellContents(self.currentCell - 1).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell--;
                    self.level.setCellContents(self.currentCell, self);
                    
                    log('Walking to next cell! currentCell is ' + self.currentCell);
                    return true
                }
            }
            
            log('Cannot walk to next cell!');
            return false;
        }

        self.check = function() {
            return self.level.getCellContents(self.currentCell + 1).object.name;
        }

        self.attack = function() {

            var obj = self.level.getCellContents(self.currentCell + 1).object

            log('jsWarrior attempts to attack!');
            if(obj.name === 'enemy') {
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

        self.rescue = function() {
            var obj = self.level.getCellContents(self.currentCell + 1).object

            log('jsWarrior attempts to rescue!');
            if(obj.name === 'captive') {
                log('jsWarrior rescues ' + obj.type + ' !');
                obj.free();
            } else {
                log('jsWarrior rescues nothing!');
            }

        }

        self.pivot = function() {
            self.moveVar *= -1;
        }

        self.getCurrentCell = function() {
            return self.currentCell;
        }
    }
})(window); 