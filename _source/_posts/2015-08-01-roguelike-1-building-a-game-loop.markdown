---
title: Roguelike 1 - Building a game loop
category: roguelike
tags: [games, javascript, html]
excerpt: roguelikes are randomized adventure games, and it's really fun to try and make them yourself! This article has a simple javascript engine. 
---

This is the first of several posts I'm writing to catalogue the development of my game.

- [Part 1](/roguelike-1-building-a-game-loop.html): Engine
- [Part 2](/roguelike-2-using-html-for-graphics.html): Using HTML as graphics
- [Part 3](/roguelike-3-generating-an-island.html): Island generation

<hr>

## Building a roguelike 

Roguelikes, a genre named after the first of it's kind, Rogue, is a turn based game where the player has infinite amount of time to make a move. Usually roguelikes offer randomized worlds and intricate, deep gameplay. The first Rogue was made in 1980 so it plays fully in the terminal using ASCII graphics. Moderns roguelikes often do feature better graphics but there are still plenty of new ones out there that focus soleley on gameplay. 

![rogue](/images/rogue.png)

Roguelikes are a great way for a programmer to flex the old development muscle. Games, for most developers, are not part of their day-to-day job while there are a lot of skills involved that are worth practicing such as algorithm design, the need to logically structure a large codebase, and unless you're already perfect at the previous, a lot of refactoring. They generally require minimal graphics so there's no need to be worried about designing characters and what not. 

A while ago I made a little 8bit rogue-ish game in Java, which was fun to do. I never finished it, and Java is not a great language to make games in so when I got the itch to improve my old work, I decided to use javascript and run it in the browser. I also quickly realized I could do this in HTML instead of canvas, which I've never tried before!

Here are two screenshots of my current work-in-progress. First is a completely randomized island with climate zones:

![rogue](/images/rogue1.png)

The second is a dungeon, demonstrating field of vision. 

![rogue](/images/rogue2.png)

## Some initial thoughts

Alright so HTML. Looking at the ASCII based roguelikes, the first thing that popped into my head was a grid of thousands of block elements. All these elements can have a class and a single character based on what kind of tile they represent, like the player, or grass, or rocks... This can be styled with common CSS. 

I also decided to make a simple but proper game loop as opposed to using just events, so that keyboard or mouse interaction can be more fluid, and so I can make the occasional animation. Then I thought I'd make it state based because screen manipulation would not be very quick or easy. See, with canvas or a similar tech you just clear the screen and draw different stuff, but HTML doesn't work like that; I would have to depend on div insertion and removal which is slow. 

## The Basics: Game loop

First , let's get some of the more basic stuff out of the way. An engine for a game like I had in mind is straight forward. I don't want or need to control separate update and drawing timings like fancier, real time games. I based mine on javascript's `requestAnimationFrame`, a more sturdy alternative to `setInterval`. All you need to do is call the start, stop and pause methods to get it going.

Here's a small jsFiddle to demonstrate:

<iframe
  style="width: 100%; height: 300px"
  src="//jsfiddle.net/jorgthuijls/j9xtL6h3/embedded/result,js,html">
</iframe>

`Engine` itself is an object literal, because juggling scope with `requestAnimationFrame` is a pain. My first attempts used an object, but `window` kept creeping back into scope. 

The most interesting part here is the `loop` function:

{% highlight javascript %}
loop: function (time) {
    if (engine.paused === false) {
        engine.update(time);
    }
    engine.draw(time);
    if (engine.running === true) {
        window.requestAnimationFrame(function (time) {
            engine.loop(time);
        });
    } else {
        engine.stop();
    }
}
{% endhighlight %}

This continuously runs the `loop` function. Inside the loop function, screen is always drawn, but the game is only updated when it's not paused. 

Because it's a simple loop, this just runs requestAnimationFrame as often as possible, which is max 60 times a second. If you add heavy processing in the update or draw method, this will slow down. Fancier games need fancier loops to keep a similar speed but with a turn based game I didn't feel that was necessary. 

## States

Games are made of several parts that needs separate key bindings, mouse events, screen handling and content. For instance, in a menu the up or down buttons do different things than they would in the game itself; one moves through the options, the other moves the player around. One way of dealing with these differences without resorting to giant IF statements is the state machine. 

There are three parts to this. The first is a `State` object, which mimics the methods of the game loop: init, start, stop, draw and update. 

The second is `StateMachine`, a singleton responsible for maintaining the state stack, keeping a particular state active, and switching from one state to the other. 

The third is a small change to the `engine` object. Gone are the `running` and `paused` variables. These are moved to `State`. Engine should also be calling the proper methods in the active state. As per the example below:

<iframe
  style="width: 100%; height: 300px"
  src="//jsfiddle.net/jorgthuijls/pqtLf23f/embedded/result,js,html">
</iframe>

Breaking down the code in there, first up is the StateMachine object:

{% highlight javascript %}
function StateMachine() {
    var _states = {};
    this.active = null;

    this.add = function (state) {
        state = state || {};
        if(typeof state.name === 'undefined') {
            //error
        }
        _states[state.name] = new State(state);
        _states[state.name].init();
        if (this.active === null) {
            this.active = _states[state.name];
        }
    };

    this.switch = function (name) {
        if (_states[name]) {
            this.active.stop();
            this.active = _states[name];
            this.active.start();
        } else {
            //throw an error
        }
    };
}

var states = new StateMachine();
{% endhighlight %}

Straight forward: a stack of states, one method to add a state to the stack, and one method to activate a state with a particular name. 

When adding a state, I decided not to expose the `State` class itself. In a more OO environment I would have used an interface, or maybe inherited the class. Javascript can do this but it made things awkward. Instead, all methods are implemented through an object containing the State methods. The only mandatory part in adding a state is `name`, which will be used for switching, everything else is optional. States don't need to implement everything. Continuing from the above:

{% highlight javascript %}
states.add({
    name: 'start',
    init: function() {}, //called once when adding a state to the stack
    start: function () {}, //called every time after switching to this
    update: function() {}, //called every update loop
    draw: function() {}, //called every draw loop
    stop: function() {} //called once upon stopping
});
{% endhighlight %}

Finally the `State` class. I'll show part of it to give you an idea of how those methods above are called. For the working code, please see the fiddle.

{% highlight javascript %}
function State(obj) {
    var _paused;
    var _running;
    var _object = obj;

    this.update = function (time) {
        if (_object.update) {
            _object.update.call(this, time);
        }
    };

    ...
}
{% endhighlight %}

This way of calling methods accomplishes a few things. First, it allows me to decorate or add to any or all of the methods before calling the user-defined ones in the state object. This is helpful because second, my implementation of `State` in the actual game is larger: every state also has its own set of key- and mouse bindings. I can handle keys in the update loop without the need to scaffold it into every `update` method in every added state. Third, thanks to `call`, inside the start, init, draw, update and stop methods, `this` will represent the State object itself, so `this.quit()` or `this.keys` is valid code when implementing a method through `states.add`:

{% highlight javascript %}
states.add({
    name: 'exit',
    init: function() {
        //"this" refers to the current state object - in this case the 
        // exit state. 
        // switching to this state will simply stop the game loop. 
        this.quit();
    }
});
{% endhighlight %}

That's all for the game loop. I'll talk about the way I'm using HTML elements to create my game in [part two](/2014/12/01/HTML-Roguelike-Part-Two/)
