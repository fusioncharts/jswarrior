/**
 * Author: Anirudh Sanjeev <anirudh@razorflow.com>
 * Date: 17/09/13
 */

(function($){
    //
    // MAIN FUNCTION
    //
    $(function() {
        configureCodemirror();
        configureToolbar ();

        // Change the canvas size
        


        window.game = new JSWarrior($('#canvas'));
        game.createLevel(window.currentLevel);
    });

    // State Variables
    var textCM, warriorController = new WarriorController();

    var configureCodemirror = function() {
        textCM = CodeMirror.fromTextArea ($("#codeEditor")[0],{
            mode: {name: "javascript"},
        });
        textCM.setSize(null, 400);

        $(".emulationModeButtons a").click(function() {
            textCM.setOption('keyMap', $(this).attr('data-mode'));
        })
    };

    var configureToolbar = function () {
        $("#playButton").click($.proxy(warriorController.play, warriorController));
        $("#stopButton").click($.proxy(warriorController.stop, warriorController));
        $("#resetButton").click($.proxy(warriorController.reset, warriorController));
    };

    function WarriorController ()
    {
        var self = this,
            levelCompleteCallback = function(){},
            code = "",
            logDiv = $("#logContainer"),
            interval;

        self.onSuccess = function() {
            $.ajax({
                type: "POST",
                data: {
                    code: code
                },
                url: "/complete/" + window.levelId,
                success: function(data) {
                    window.location.href = data;
                }
            });
        };

        self.activateNextButton = function () {
            $("#nextLevelContainer").show();
            // $("#nextLevelButton").click(function(){
            //     self.onSuccess();
            // });
        };
        
        self.hideNextButton = function() {
            $("#nextButtonContainer").hide();
            // $("#nextLevelButton").unbind();
        }

        self.onLog = function(msg, color) {
            var logItem = $("<p>").text(msg);
            
            if(color) {
                switch(color) {
                    case "green":
                        logItem.css('background-color', '#dff0d8');
                        break;
                    case "orange":
                        logItem.css('background-color', '#fcf8e3');
                        break;
                    case "red":
                        logItem.css('background-color', '#f2dede');
                        break;
                }
            }
            
            logDiv.append(logItem);

            $('#console').scrollTop(99999);
            console.log(msg);
        };

        self.onLevelComplete = function(){
            $("#playButton").removeAttr("disabled");
            self.activateNextButton();
        };

        self.onLevelFailed = function() {
            $("#playButton").removeAttr("disabled");
        };

        self.play = function () {
            self.hideNextButton();
            logDiv = $("#logContainer");
            logDiv.empty();
            code = textCM.getValue();
            $("#codeEditor").text(code);
            $("#playButton").attr("disabled", "disabled");

            game.setCallbacks(self.onLog, self.onLevelComplete, self.onLevelFailed);
            
            game.createLevel(window.currentLevel);
            interval = game.run(code);
        };

        self.stop = function() {
            self.hideNextButton();
            logDiv = $("#logContainer");
            $("#playButton").removeAttr("disabled");
            clearInterval(interval);
        };
        
        self.reset = function() {
            self.hideNextButton();
            logDiv = $("#logContainer");
            textCM.setValue($("#defaultTemplate").text());
        }
    }

    window.makeWarriorLevel = function(count, target, contents) {
        var cells = [];

        for(var i = 0; i < contents.length; i ++) {
            var item = contents[i];

            switch(item[1]){
                case "warrior":
                    cells.push({
                        name: 'warrior',
                        cell: item[0],
                        health: 20,
                        attackDamage: 5
                    });
                    break;
                case "crab":
                    cells.push({
                        name: 'enemy',
                        "attackType": "melee",
                        type: "crab",
                        cell: item[0],
                        pivoted: item[2] ? true : false,
                        health: 12,
                        attackDamage: 3
                    });
                    break;
                case "troll":
                    cells.push({
                        name: 'enemy',
                        "attackType": "melee",
                        type: "troll",
                        cell: item[0],
                        pivoted: item[2] ? true : false,
                        health: 24,
                        attackDamage: 3
                    });
                    break;
                case "javaliner":
                    cells.push({
                        name: 'enemy',
                        "range": 3,
                        "attackType": "ranged",
                        type: "javaliner",
                        cell: item[0],
                        pivoted: item[2] ? true : false,
                        health: 7,
                        attackDamage: 3
                    });
                    break;
                case "diamond":
                    cells.push({
                        name: 'diamond',
                        type: 'diamond',
                        cell: item[0]
                    });
                    break;
                default:
                    alert("unrecognized level type")
            }
        }
        return {
            numCells: count,
            target: target,
            cells: cells
        };
    }
})(jQuery);
