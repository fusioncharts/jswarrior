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
    });

    // State Variables
    var textCM, warriorController = new WarriorController();

    var configureCodemirror = function() {
        textCM = CodeMirror.fromTextArea ($("#codeEditor")[0],{
            mode: {name: "javascript"}
        });

        $(".emulationModeButtons a").click(function() {
            textCM.setOption('keyMap', $(this).attr('data-mode'));
        })
    };

    var configureToolbar = function () {
        $("#playButton").click($.proxy(warriorController.play, warriorController));
        $("#stopButton").click($.proxy(warriorController.stop, warriorController));
    };

    function WarriorController ()
    {
        var self = this,
            levelCompleteCallback = function(){},
            code = "",
            game = null,
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
            $("#nextLevelButton").click(function(){
                self.onSuccess();
            });
        };

        self.onLog = function(msg) {
            logDiv.append("<p>" + msg + "</p>");
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
            logDiv = $("#logContainer");
            logDiv.empty();
            var code = textCM.getValue();
            $("#playButton").attr("disabled", "disabled");

            game = new JSWarrior(self.onLog, self.onLevelComplete, self.onLevelFailed);
            game.createLevel(window.currentLevel);
            interval = game.run(code);
        };

        self.stop = function() {
            $("#playButton").removeAttr("disabled");
            clearInterval(interval);
        };
    }
})(jQuery);
