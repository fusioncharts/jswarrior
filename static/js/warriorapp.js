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
    var textCM, consoleCM, warriorController = new WarriorController();

    var configureCodemirror = function() {
        textCM = CodeMirror.fromTextArea ($("#codeEditor")[0],{
            mode: {name: "javascript"}
        });
        consoleCM = CodeMirror.fromTextArea ($("#consoleEditor")[0]);

        $(".emulationModeButtons a").click(function() {
            textCM.setOption('keyMap', $(this).attr('data-mode'));
        })
    };

    var configureToolbar = function () {
        $("#playButton").click($.proxy(warriorController.play, warriorController));
        $("#stopButton").click($.proxy(warriorController.play, warriorController));
    };

    function WarriorController ()
    {
        var self = this,
            levelCompleteCallback = function(){},
            code = "";

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

        self.activateNextButton = function (data) {
            $("#nextLevelContainer").show();
            $("#nextLevelButton").click(function(){
                self.onSuccess();
            });
        };

        self.play = function () {
            var code = $("#codeEditor").text();

            // Just pretend that the thing was successful
            self.activateNextButton();
        };

        self.stop = function() {

        };
    }
})(jQuery);
