$(function() {
    myCodeMirror = CodeMirror($('.code-panel')[0], {
        value: "jsWarrior.turn = function() {\n\t//Awesome code here!!\n}",
        mode:  "javascript",
        theme: "monokai"
    });

    $('#run').on('click', function() {
        var game = new JSWarrior();
        var val = myCodeMirror.getValue();
        game.run(val);
    });
});