$(function() {
    myCodeMirror = CodeMirror($('.code-panel')[0], {
        value: "jsWarrior.turn = function(warrior) {\n\t//Awesome code here!!\n}",
        mode:  "javascript",
        theme: "monokai"
    });

    window.logger = function(str) {
        console.log(str);

        // $('.log-panel').append(
        //     $('<div/>').text(str)
        // ).scrollTop(99999);
    };

    $('#run').on('click', function() {

        var level = {
            numCells: 11,
            target: 0,
            cells: [
                {
                    name: 'captive',
                    type: 'Captive',
                    cell: 1,
                },
                {
                    name: 'enemy',
                    type: 'Archer',
                    attackType: 'ranged',
                    range: 3,
                    health: 10,
                    cell: 2,
                    attackDamage: 3,
                    pivoted: true
                },
                {
                    name: 'enemy',
                    type: 'Thick Sludge',
                    attackType: 'melee',
                    health: 25,
                    cell: 7,
                    attackDamage: 3
                },
                {
                    name: 'enemy',
                    type: 'Wizard',
                    attackType: 'ranged',
                    range: 3,
                    health: 3,
                    cell: 9,
                    attackDamage: 11
                },
                {
                    name: 'captive',
                    type: 'Captive',
                    cell: 10,
                },
                {
                    name: 'warrior',
                    cell: 5,
                    health: 20,
                    attackDamage: 5
                }
            ]
        };

        var game = new JSWarrior(logger);
        game.createLevel(level);
        var val = myCodeMirror.getValue();
        $('.log-panel').empty();
        game.run(val);
    });
});