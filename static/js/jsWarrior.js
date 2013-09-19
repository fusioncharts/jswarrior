/****************************************************************************
 *                                                                          *
 *                                                                          *
 *                  _   __        __              _                         *
 *                 (_)__\ \      / /_ _ _ __ _ __(_) ___  _ __              *
 *                 | / __\ \ /\ / / _` | '__| '__| |/ _ \| '__|             *
 *                 | \__ \\ V  V / (_| | |  | |  | | (_) | |                *
 *                _/ |___/ \_/\_/ \__,_|_|  |_|  |_|\___/|_|                *
 *               |__/                                                       *
 *                                                                          *
 *                          Author : Ameen Ahmed                            *
 ****************************************************************************/

/*
 *  jsWarrior is a small programming game where the user writes a program to 
 *  control a character's movements in the game. The api documentation can be
 *  found in the readme.md file of this repository.
 */

(function() {
    /**
     * Class        :  JSWarrior
     * Description  :  Main game class
     * Params       :  log => A function which is called by the entities of the
     *                         game whenever an action occurs
     */
    var JSWarrior = function JSWarrior(canvas) {
        var self = this,
            cells = [],
            interval;

        // Constants
        var MAX_TURNS = 100;
        var TURN_TIME = 1000;

        self.canvas = canvas;

        self.callbacks = {};

        var log = function() {};
        var onLevelComplete = function() {};
        var onLevelFail = function() {};

        self.setCallbacks = function(_log, _onLevelComplete, _onLevelFail) {
            log = _log;
            onLevelComplete = _onLevelComplete;
            onLevelFail = _onLevelFail;
        }
        
        /**
         * Function     :   createLevel
         * Description  :   Use this function to create the level
         * Params       :   levelObj => An object describing the level properties.  
         */ 
        self.createLevel = function (levelObj) {
            var numCells = levelObj.numCells,
                target = levelObj.target,
                cells = levelObj.cells,
                initCells = [];

            self.level = null;
            self.warrior = null;

            // Initialize the level with
            for(var i=0; i<numCells; i++) {
                initCells[i] = new Empty();
            }

            var w = self.canvas.innerWidth() / numCells;
            for(var i=0; i< numCells; i++) {
                self.canvas.append(
                    $('<div/>').addClass('cell')
                    .css({
                        'width': w,
                        'height': 100,
                        'left': i * w,
                        'top': 300
                    })
                )
            }

            // Create a new level
            self.level = new Level(numCells, target, initCells, self.canvas.innerWidth(), self.canvas.innerHeight());

            // Loop through the level object and create the necessary objects and put
            // them into the cells in the level
            for(var i=0; i<cells.length; i++) {
                var obj = cells[i];
                
                // If any object exists without a cell number throw an exception
                if(obj.cell !== 0 && !obj.cell) {
                    throw 'Level : Cannot create obj with out a cell number';
                    return;
                }


                var cellNum = obj.cell;
                // If cell num exceeds the bounds, throw an error
                if(cellNum < 0 || cellNum >= numCells) {
                    throw "cell num of object exceeds bounds";
                }
                obj.level = self.level;

                if(obj.name === 'enemy') {
                    var enemy = new Enemy(obj, log, self.context);
                    self.level.setCellContents(cellNum, enemy);
                    var $obj,
                        $javelin;

                    if(obj.type === 'sludge') {
                        $obj = $('<div/>').addClass('sludge');
                    } else if(obj.type === 'thick sludge') {
                        $obj = $('<div/>').addClass('thick-sludge');
                    } else if(obj.type === 'archer') {
                        $obj = $('<div/>').addClass('archer');
                        $javelin = $('<div/>').addClass('javelin');
                        $javelin.css({
                            left: cellNum * (self.canvas.innerWidth() / numCells),
                            display: 'none'
                        });
                        self.canvas.append($javelin);
                        enemy.javelin = $javelin;
                    }

                    if(enemy.pivoted) {
                        $obj.addClass('pivoted');
                    }

                    $obj.css({
                        left: cellNum * (self.canvas.innerWidth() / numCells)
                    });

                    

                    self.canvas.append($obj);
                    

                    enemy.renderObject = $obj;
                    

                } else if(obj.name === 'captive') {
                    var captive = new Captive(obj, log, self.context);
                    self.level.setCellContents(cellNum, captive);
                    var $obj = $('<div/>').addClass('captive');

                    self.canvas.append($obj);

                    $obj.css({
                        left: cellNum * (self.canvas.innerWidth() / numCells)
                    })

                    captive.renderObject = $obj;
                } else if(obj.name === 'warrior') {
                    if(!self.warrior) {

                        self.warrior = new Warrior(obj, log, self.context);
                        var $obj = $('<div/>').addClass('warrior');
                        $obj.css({
                            left: cellNum * (self.canvas.innerWidth() / numCells)
                        })
                        self.canvas.append($obj);

                        self.warrior.renderObject = $obj;

                    } else {
                        throw "Cannot create two warriors in a level";
                    }
                } else {
                    throw "Cannot create object " + obj.name;
                }
            }
        }
        self.currentMove = 'other';



        var global = (typeof window === 'undefined') ? global : window;
        global.jsWarrior = {};

        /**
         * Function     :   run
         * Description  :   Runs the code turn by turn
         * Params       :   The code to run the level
         */ 
        self.run = function(code) {
            
            // Stop the code if it is running
            clearInterval(interval);

            // Create a function out of the code and run it
            (new Function(code))();    

            var turn = 0;

            var runCell = 0;
            function copyCells (array) {
                var arr = [];
                for(var i=0; i<array.length; i++) {
                    arr.push(array[i]);
                }
                return arr;
            }
            log('turn ' + (turn + 1));
            var cells = copyCells(self.level.cells);
            var health = $('<div/>').addClass('health');
            health.text(20);
            self.canvas.append(health);
            // Start running the code turn by turn each turn is executed every 100ms currently 
            interval = setInterval(function() {
                
                var level = self.level;


                try {
                    
                    

                    var currentObject = cells[runCell].object;

                    if(currentObject.name === 'warrior') {
                        if(currentObject.health > 0) {
                            self.warrior.clearMove();
                            jsWarrior.turn(self.warrior);
                        }
                        
                        runCell++;
                        
                    } else if(currentObject.name === 'enemy' || currentObject.name === 'captive') {
                        if(currentObject.health > 0) {
                            currentObject.playTurn();    
                        }
                        
                        runCell++;
                    } else {
                        runCell++;
                    }

                    if(runCell === level.numCells) {
                        turn++;
                        log('turn ' + (turn + 1));
                        runCell = 0;
                    }
                    health.text(self.warrior.health);
                    // Loop through the level and find enemies and make them do their action for
                    // this turn

                    // if(self.currentMove === 'other') {
                    //     for(var i=0;i<level.cells.length; i++) {
                    //         var cell = level.cells[i];
                            
                    //         if(cell.object.name === 'enemy') {
                    //             cell.object.playTurn();
                    //         }
                    //     }
                    // }


                    // // Check warrior's health. If its 0 warrior died :( stop the code execution
                    if(self.warrior.health <= 0) {
                        clearInterval(interval);
                        onLevelFail ();
                        self.warrior.die();
                        log('jsWarrior died!');
                        log('jsWarrior failed this level!');
                        return;
                    }
                    // // Run the turn code provided by the user
                    // if(self.currentMove === 'warrior') {
                    //     jsWarrior.turn(self.warrior);
                    //     warrior.draw(context, function() {
                    //         self.currentMove = 'rest';
                    //     })
                    // }
                        
                    // turn++;

                    // // Only 100 turns can be played if it exceeds js warrior failed
                    if(turn === 100) {
                        clearInterval(interval);
                        log('jsWarrior failed this level!');
                        onLevelFail ();
                        return;
                    }

                    // // If jsWarrior is at the target cell he won :)
                    if(self.warrior.getCurrentCell() === self.level.target) {
                        log('Hurray you completed this level!');
                        clearInterval(interval);
                        onLevelComplete();
                        return;
                    }

                } catch(exception) {
                    // If any exception occurs this will catch it and tell the user that js warrior failed because
                    // of an exception in the user's code
                    log(exception.toString());
                    log('jsWarrior failed this level!');
                    clearInterval(interval);
                    onLevelFail ();
                    throw exception;
                }
            }, 250);

            return interval;
        };
    };

    /**
     * Class        :   Captive
     * Description  :   The captive object which can be freed
     * Params       :   
     *                 options : {
     *                     type: 'The name displayed in the log',
     *                     cell: 'number representing the current cell the captive is in',
     *                     level: 'The level object which the captive belongs to'
     *                 }
     *
     *                 log : The function which is called whenever an action is performed on or by the captive
     */
    function Captive(options, log) {
        var self = this;

        self.name = 'diamond';
        self.type = options.type;
        self.cell = options.cell;
        self.level = options.level;

        self.bound = true;

        /**
         * Function     :   free
         * Description  :   Called to free the captive
         */
        self.free = function() {
            self.bound = false;

            // tell the user that the captive is free and clear the cell in the level
            
            self.renderObject.animate({
                opacity: 0
            }, 300, function() {
                self.renderObject.animate({
                    opacity: 1
                }, 300, function() {
                    self.renderObject.animate({
                        opacity: 0
                    }, 300, function() {
                        log(options.type + ' is now yours!');
                        self.level.setCellContents(self.cell, new Empty());
                    });
                });
            });
                

        }

        /**
         * Function     :   hit
         * Description  :   Called to hit this captive. The captive instantly dies when gets hit.
         */
        self.hit = function() {
            self.renderObject.animate({
                opacity: 0
            }, 300, function() {
                self.renderObject.animate({
                    opacity: 1
                }, 300, function() {
                    self.renderObject.animate({
                        opacity: 0
                    }, 300, function() {
                        log(options.type + ' died!');
                        self.level.setCellContents(self.cell, new Empty());
                    });
                });
            });

        }
    }

    /**
     * Function     :   Enemy
     * Description  :   The Enemy object which can be of two types melee and ranged, Melee units attack the warrior
     *                  when he is adjacent to them and ranged units have a range and if the warrior is inside the
     *                  enemy's range, the unit will shoot the warrior
     * Params       :   
     *                 options : {
     *                     type: 'The name of the unit',
     *                     attackType: 'The attackType, melee or ranged',
     *                     range: 'If the unit is ranged this specifies the range of the units in cells',
     *                     cell: 'The current cell occupied by the unit'
     *                     health: 'The health of the unit which decreases eveytime it is hit and dies if it is <= 0',
     *                     level: 'The level object',
     *                     attackDamage: 'The amount of damage this unit inflicts on jsWarrior',
     *                     pivoted: 'if this is true the unit attacks from left to right. Default is right to left'
     *                 }
     *
     *                 log: The function which is executed for every action performed by or this object
     */
    function Enemy(options, log, context) {
        var self = this;

        self.name = 'enemy';
        self.type = options.type;
        self.attackType = options.attackType;
        self.range = options.range;
        self.cell = options.cell;
        self.health = options.health;
        self.level = options.level;
        self.attackDamage = options.attackDamage;
        self.firstAttack = true;
        self.pivoted = options.pivoted;
        self.context = context;



        self.die = function() {

            self.renderObject.animate({
                opacity: 0
            }, 300, function() {
                self.renderObject.animate({
                    opacity: 1
                }, 300, function() {
                    self.renderObject.animate({
                        opacity: 0
                    }, 300, function() {

                    });
                });
            });
        };
        /**
         * Function     :   hit
         * Description  :   Called when the enemy is hit
         * params       :   damage => The amount of damage to inflict
         */
        self.hit = function(damage) {
            self.health -= damage;
            if(self.type === 'archer') {
                self.renderObject.addClass('archer-hit')
            }
            // If health is <= 0 the enemy died. Tell the user and clear the cell in the level
            self.renderObject.animate({
                left: self.level.getScreenPosition(self.cell).x + 10
            }, 50, function() {
                self.renderObject.animate({
                    left: self.level.getScreenPosition(self.cell).x - 10
                }, 50, function() {
                    self.renderObject.animate({
                        left: self.level.getScreenPosition(self.cell).x + 10
                    }, 50, function() {
                        self.renderObject.animate({
                            left: self.level.getScreenPosition(self.cell).x
                        }, 50, function() {
                            self.renderObject.removeClass('archer-hit')
                            if(self.health <= 0) {
                                log(self.type + ' died!');
                                self.level.setCellContents(self.cell, new Empty());
                                
                                self.die();
                            }
                        });
                    });
                });
            })
                            
        }

        /**
         * Function     :   playTurn
         * Description  :   Called during each turn to see if the enemy can hit the warrior
         */
        self.playTurn = function() {
            // If the enemy is a melee unit check the adjacent cell for the warrior if found attack!
            if(self.attackType === 'melee') {
                var obj; 
                if(self.pivoted) {
                    obj = self.level.getCellContents(self.cell + 1).object;
                    
                } else {
                    obj = self.level.getCellContents(self.cell - 1).object;
                }
                if(obj.name === 'warrior') {
                    if(!self.firstAttack) {
                        if(self.type === 'thick sludge') {
                            self.renderObject.addClass('troll-attack');
                        }
                        self.renderObject.animate({
                            left: self.level.getScreenPosition(obj.currentCell).x
                        }, 50, function() {
                            self.renderObject.animate({
                                left: self.level.getScreenPosition(self.cell).x
                            }, 50, function() {
                                obj.hit(self.attackDamage);
                                self.renderObject.removeClass('troll-attack');
                                log(self.type + ' hits jsWarrior and deals ' + self.attackDamage + ' damage!');
                            });
                        });
                        
                    } else {
                        self.firstAttack = false;
                    }       
                }
            } else if(self.attackType === 'ranged') {
                // If the enemy unit is ranged check the cells in the range and see if there is a clear shot
                // to the warrior if so take it
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

                        self.renderObject.addClass('archer-with-arrow');
                        setTimeout(function() {
                            self.renderObject.removeClass('archer-with-arrow');
                            self.renderObject.addClass('archer-shoot');
                            setTimeout(function() {
                                self.renderObject.removeClass('archer-shoot');
                                self.javelin.css({
                                    display: 'block'
                                });
                                
                                self.javelin.animate({
                                    left: self.level.getScreenPosition(warrior.currentCell).x
                                }, 100, function() {
                                    self.javelin.css({
                                        display: 'none'
                                    });
                                    warrior.hit(self.attackDamage);
                                    log(self.type + ' hits jsWarrior and deals ' + self.attackDamage + ' damage!');    
                                });

                                
                            }, 100);    
                        }, 100);
                        
                    }
                    self.firstAttack = false;
                } else {
                    self.firstAttack = true;
                }

            }       
        }
    }

    /**
     * Class        :   Cell
     * Description  :   Pseudo Class which holds the object currenly its not of much use. sue me :D 
     */
    function Cell(object) {
        var self = this;

        self.object = object;
    }

    /**
     * Class        :   Level
     * Description  :   The level object which holds the contents and data of each level
     * Params       :   num => the total number of cells in the level
     *                  target => the target cell for the warrior to be to win this level
     *                  lvl => the lvl array which contains the objects
     */
    function Level(num, target, lvl, width, height) {
        var self = this;
        self.numCells = num;
        self.target = target;
        self.cells = [];

        self.width = width;
        self.height = height;

        // Initialize the cells
        for(var i=0; i<num; i++) {
            self.cells.push(new Cell(lvl[i]));
        }

        self.getCellWidth = function() {
            return self.width / self.numCells;
        };

        self.getScreenPosition = function(cellNum) {
            return {
                x: (self.width / self.numCells) * cellNum,
                y: self.height - 60
            };
        };

        // Getter for a cell when index is provided
        self.getCellContents = function(index) {
            return self.cells[index];
        }
        // Setter for a cell when index and an object is provided
        self.setCellContents = function(index, obj) {
            self.cells[index] = new Cell(obj);
        }
    }

    /**
     * Class        :   Empty
     * Description  :   Pseudo Class to signinfy an empty cell 
     */
    function Empty() {
        this.name = 'empty';
    }

    /**
     * Class        :   Warrior
     * Description  :   Main warrior class. The protoganist of the game. nuff said..
     * Params       :   
     *                 options : {
     *                     level: 'the level',
     *                     cell: 'the current cell where the warrior is',
     *                     health: 'the maximum health of the warrior',
     *                     attackDamage: 'The damage that js warrior can inflict',
     *                 } 
     *
     *                 log => the function which is called for every action performed by jsWarrior
     * 
     */
    function Warrior(options, log) {
        var self = this;

        self.level = options.level;
        self.currentCell = options.cell;
        self.health = options.health;
        self.attackDamage = options.attackDamage;
        self.name = 'warrior';
        self.moveVar = 1;
        self.level.setCellContents(self.currentCell, self);
        self.moved = false;

        /**
         * Function     :   walk
         * Description  :   Makes the warrior walk to the next cell either forward or backward
         * Params       :   direction => 'forward' || 'backward'
         */
        
        self.setMove = function() {
            if(!self.moved) {
                self.moved = true;    
            } else {
                throw "jsWarrior cannot perform 2 moves in a turn!";
            }
            
        };

        self.clearMove = function() {
            self.moved = false;
        };

        self.walk = function(direction) {
            self.setMove();
            // If direction is forward move to the next cell if it is empty
            var dVar = self.moveVar * -1;
            if(direction === 'forward' || direction == undefined) {
                if(self.level.getCellContents(self.currentCell + self.moveVar).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell += self.moveVar;
                    self.level.setCellContents(self.currentCell, self);

                    $(self.renderObject).animate({
                        left: self.level.getScreenPosition(self.currentCell + dVar + self.moveVar).x
                    }, 50, function() {
                        log('Walking to next cell! currentCell is ' + self.currentCell);    
                    });
                    
                    return true
                }    
            } else if(direction === 'backward') {
                // If direction is backward move to the previous cell if it is empty
                if(self.level.getCellContents(self.currentCell - self.moveVar).object.name === 'empty') {
                    self.level.setCellContents(self.currentCell, new Empty());
                    self.currentCell -= self.moveVar
                    self.level.setCellContents(self.currentCell, self);

                    $(self.renderObject).animate({
                        left: self.level.getScreenPosition(self.currentCell + dVar + self.moveVar).x
                    }, 50, function() {
                        log('Walking to next cell! currentCell is ' + self.currentCell);    
                    });
                    
                    
                    return true
                }
            }

            $(self.renderObject).animate({
                left: self.level.getScreenPosition(self.currentCell + dVar + self.moveVar + 1).x
            }, 50, function() {
                $(self.renderObject).animate({
                    left: self.level.getScreenPosition(self.currentCell).x
                }, 50, function() {
                    log('Cannot walk to next cell!');        
                });
            });
            // Oh oh something is blocking the warrior's path
            
            return false;
        }

        /**
         * Function     :   check
         * Description  :   Check the contents of the next cell either forward or backwards
         * Params       :   direction => 'forward' || 'backward'
         */
        self.check = function(direction) {
            var numCells = self.level.numCells;
            // If the next/prev cell is out of bounds then return wall
            if(self.currentCell + self.moveVar >= numCells || self.currentCell + self.moveVar < 0) {
                return 'wall';
            }
            // return the cells name checking its contents
            if(direction === 'forward' || direction === undefined) {
                return self.level.getCellContents(self.currentCell + self.moveVar).object.name;    
            } else if(direction === 'backward') {
                return self.level.getCellContents(self.currentCell - self.moveVar).object.name;    
            }
            
        }

        /**
         * Function     :   attack
         * Description  :   Attack whatever is in the next cell
         * Params       :   direction =? 'forward' || 'backward'
         */
        self.attack = function(direction) {
            self.setMove();
            var obj;
            if(direction === 'forward' || direction === undefined) {
                obj = self.level.getCellContents(self.currentCell + self.moveVar).object    
            } else if(direction === 'backward') {
                obj = self.level.getCellContents(self.currentCell - self.moveVar).object    
            }
            self.renderObject.addClass('warrior-attack');
            $(self.renderObject).animate({
                left: self.level.getScreenPosition(self.currentCell - 1 + self.moveVar + 1).x
            }, 50, function() {
                $(self.renderObject).animate({
                    left: self.level.getScreenPosition(self.currentCell).x
                }, 50, function() {
                    log('jsWarrior attempts to attack!');
                    // If the next cell is an enemy or a captive hit that bitch
                    if(obj.name === 'enemy' || obj.name === 'captive') {
                        self.renderObject.removeClass('warrior-attack');
                        log('jsWarrior inflicted ' + self.attackDamage + ' damage to the ' + obj.type);
                        obj.hit(self.attackDamage);
                        
                    } else {
                        // If the next cell is empty or a wall, warrior hits nothing and looks ridiculous attacking an empty
                        // space maybe he smoked pot today
                        log('jsWarrior warrior hit nothing!');
                        
                    }
                });
            });
        }

        /**
         * Function     :   hit
         * Description  :   Called when somebody hits the warrior, reduces the health by the param damage and if the health
         *                  becomes <= 0 then he dies, unlike chuck norris :P
         */
        self.hit = function(damage) {
            self.health -= damage;
        
            self.renderObject.animate({
                left: self.level.getScreenPosition(self.currentCell).x + 10
            }, 50, function() {
                self.renderObject.animate({
                    left: self.level.getScreenPosition(self.currentCell).x - 10
                }, 50, function() {
                    self.renderObject.animate({
                        left: self.level.getScreenPosition(self.currentCell).x + 10
                    }, 50, function() {
                        self.renderObject.animate({
                            left: self.level.getScreenPosition(self.currentCell).x
                        }, 50, function() {
                            console.log('Hit!');
                        });
                    });
                });
            });
        }

        /**
         * Function     :   rest
         * Description  :   Called when the warrior needs rest. Makes the warrior gain 2 health points
         */
        self.rest = function(damage) {
            self.setMove();
            self.renderObject.addClass('warrior-rest');
            setTimeout(function() {
                log('jsWarrior rested and got 2 health!');
                self.health += 2;
                self.renderObject.removeClass('warrior-rest');
                if(self.health > 20) {
                    self.health = 20;
                }
            }, 200);
                
        };

        self.die = function() {
            self.renderObject.animate({
                opacity: 0
            }, 300, function() {
                self.renderObject.animate({
                    opacity: 1
                }, 300, function() {
                    self.renderObject.animate({
                        opacity: 0
                    }, 300, function() {

                    });
                });
            });
        }

        /**
         * Function     :   rescue
         * Description  :   Called when the warrior attemps to rescue something in the next cell
         * Params       :   direction => 'forward' || 'backward'
         */
        self.collect = function(direction) {
            self.setMove();
            var obj;
            if(direction === 'forward' || direction === undefined) {
                obj = self.level.getCellContents(self.currentCell + self.moveVar).object    
            } else if(direction === 'backward') {
                obj = self.level.getCellContents(self.currentCell - self.moveVar).object    
            }
            
            $(self.renderObject).animate({
                left: self.level.getScreenPosition(self.currentCell - 1 + self.moveVar + 1).x
            }, 50, function() {
                $(self.renderObject).animate({
                    left: self.level.getScreenPosition(self.currentCell).x
                }, 50, function() {
                    log('jsWarrior attempts to collect!');

                    // If the specified cell contains a captive warrior recues him hurray!
                    if(obj.name === 'captive') {
                        log('jsWarrior collects ' + obj.type + ' !');
                        obj.free();
                    } else {
                        // If the warrior attempts to rescue a cell without a captive he rescues nothing
                        log('jsWarrior collects nothing!');
                    }

                });
            });
                    
        }

        /**
         * Function     :   look
         * Description  :   Returns the contents of three cells
         * Params       :   direction => 'forward' || 'backward'
         */
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

        /**
         * Function     :   shoot
         * Description  :   Warrior shoots an arrow when called. The arrow has a range of three cells
         * Params       :   direction => 'forward' || 'backward'
         */
        self.shoot = function(direction) {
            self.setMove();
            var array = [];
            var numCells = self.level.numCells;
            var dir;
            log('jsWarrior shoots an arrow')

            if(direction === 'forward' || direction === undefined) {
                dir = 1;
            } else if(direction === 'backward') {
                dir = -1;
            }
            // Loop and check the next three cells in the given direction for something
            for(var i=0; i<3; i++) {
                var tCell = self.currentCell + ((i+1)*self.moveVar) * dir;
                if(tCell >= numCells || tCell < 0) {
                    log('arrow hits the wall!');
                    return;
                }

                var obj = self.level.getCellContents(tCell).object;

                // When a cell in range has an enemy or captive hit it
                if(obj.name === 'enemy' || obj.name === 'captive') {
                    log('jsWarrior inflicted 3 damage to the ' + obj.type);
                    obj.hit(3);
                    return;
                }
            }

            // If nothing found in the arrow's path it hits nothing
            log('arrow hits nothing!!');
        }

        /**
         * Function     :   pivot
         * Description  :   turns the jsWarrior to the opposite direction
         */
        self.pivot = function() {
            self.setMove();
            log('jsWarrior turned!');
            if(!self.renderObject.hasClass('pivoted')) {
                self.renderObject.addClass('pivoted');
            } else {
                self.renderObject.removeClass('pivoted');
            }
            self.moveVar *= -1;
        }

        /**
         * Function     :   getCurrentCell
         * Description  :   returns the current cell jsWarrior is at
         */
        self.getCurrentCell = function() {
            return self.currentCell;
        }
    }

    if(typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
        module.exports = JSWarrior;    
    } else {
        window.JSWarrior = JSWarrior;
    }
})();