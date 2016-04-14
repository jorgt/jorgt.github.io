---
title: Roguelike 2 - Using HTML for graphics
category: roguelike
tags: [games, javascript, html]
excerpt: roguelikes are randomized adventure games, and it's really fun to try and make them yourself! This article has some info on HTML based tiles.
---
This is the second of several posts I'm writing to catalogue the development of my game. This article focusses on how to use HTML as graphics.

- [Part 1](/roguelike-1-building-a-game-loop.html): Engine
- [Part 2](/roguelike-2-using-html-for-graphics.html): Using HTML as graphics
- [Part 3](/roguelike-3-generating-an-island.html): Island generation

<hr>

Continuing from [Part 1](/2014/11/27/HTML-Roguelike-Part-One/), where I scaffolded a game loop and a state stack, now on to the more interesting bit: handling HTML elements in a game. 

Everything you see on screen is an HTML element. There are two main 'categories' of elements. The first is the structure that holds everything in place. The second are the elements that make up the tiles of the game. The first one is straight forward, just a bunch of static divs, so I'll just focus on the second category. 

## The decorator pattern

All parts of the game are controlled by Javascript. Since almost all parts of the game are also HTML elements, this project uses the decorator pattern liberally to attach more actions to elements. Simply put, it allows the game to store objects that act more like game objects, while still capable of being HTML elements. Here's a fiddle with an example (also see *Assets* below).

<iframe
  style="width: 100%; height: 300px"
  src="//jsfiddle.net/jorgthuijls/4LLwh6uj/embedded/js,result">
</iframe>

I chose not to extend the prototype of native class `HTMLElement` for this because not all methods added this way are applicable to all elements. This methods just expands the capabilities of a single object of type `HTMLElement`. More specifically, `move` will move the object `n` amount of pixels to the left or right by setting the specific `dataset` attributes, and then parsing those as style in the `draw` function. This allows me to do all sorts of checks and balances before manipulating the actual position of the element on the screen. 

I'm using this pattern for almost everything that has a shared componenent, that in other languages might have been an inherited class or interface. 

## Tiles and assets

Two concepts. a Tile is a square of a particular size representing a specific chunk of the game world. This drives game mechanics and visuals, so Tiles are more functional in nature and can be seen as the definition of said chunk of game. There are tiles for rock, water and trees, but also for players, monsters and items. 

The second concept is assets, which govern the technical nature of a chunk in the game world. An asset has actions like the ability to position itself on the screen and can keep track of all attributes like current position, wether it's visible to the player or invisible etc. Part of an asset in this scenario is a Tile type, but all actions and attributes are more or less independent of that. An asset is like the implementation of a game chunk. 

To streamline the process of defining Tiles and creating Assets, the game has the following:

- a *tile bank*, holding information about every type of tile out there. I want a central repository which will just simply give me a tree, without me specifying every time there needs to be a `*` character in it, or that you can't walk through a tree. 
- an *asset generator*, which implements a tile using the decorator pattern explained above.

#### Tilebank

{% highlight javascript %}
function TileBank() {
    var _bank = {};

        this.add = function(name, sign, speed, walkable, diggable, blocking) {
            _bank[name] = {
                name: name,
                sign: sign,
                blocking: blocking,
                speed: speed,
                walkable: walkable,
                diggable: diggable,
            };
        };

        this.get = function(name) {
            return new Tile(_bank[name]);
        };

        function Tile(opt) {
            this.name = opt.name;
            this.sign = opt.sign;
            this.blocking = opt.blocking;
            this.speed = opt.speed;
            this.walkable = opt.walkable;
            this.diggable = opt.diggable;
            this.info = {};
            this.getInfo = function() {

            };
        }
}
{% endhighlight %}

The reason `TileBank` creates new `Tile` objects is that every tile you're getting out should be unique. If I simply return the object literal, I can never tweak that particular tile without changing all tiles of that type - the object literal would be referenced everywhere. 

Usage example:

{% highlight javascript %}
var bank = new TileBank();
bank.add('player', '@', 1, true, true, true);
bank.add('sea', '~', 1, false, false, false);
bank.add('deepsea', '~', 1, false, false, false);
//etcetera
var tile = bank.get('sea');
{% endhighlight %}

#### Assets

The Asset function uses the decorator described above. What you see below is not the full code, it's meant to show you how I've approached creating assets and should be used as an example.  

{% highlight javascript %}
function Asset(tile, x, y) {
    //create a new div, then add my game related functions to it. 
    var element = decorateObject(document.createElement('div'));

    //then, set the games ASCII grahpic as the content of the div, 
    //and place it in the right location. Also add a meaningful 
    //classname so we can use CSS to give it some colour
    element.innerHTML = tile.sign;
    element.set('left', y);
    element.set('top', x);
    element.classList.add('game-object-' + tile.name);

    return element;

    function decorateObject(obj) {
        obj.style.position = 'fixed';

        obj.set = function (variable, value) {
            this.dataset[variable] = value;
        }

        obj.get = function (variable) {
            return parseInt(this.dataset[variable] || 0);
        }

        obj.draw = function () {
            var px = ['top', 'left'];
            for (var o in px) {
                obj.style[px[o]] = this.dataset[px[o]] + 'px';
            }
        }

        return obj;
    }
};
{% endhighlight %}

To get a tree in grid position [5,10] and put it in the browser all that's left to do is: 

{% highlight javascript %}
var tree = Asset(bank.get('tree'), 5, 10);
document.body.appendChild(tree); //it's an HTMLElement
tree.draw(); //use the added function `draw` to position our tree
{% endhighlight %}

In reality this should be fleshed out. My roguelike implements not only static objects like trees and grass, but also moving elements like the player object. They have the `get`, `set` and `draw` functions, but were run through an additional decorator to add functions for movement, for instance collision detection. 

With some CSS styling to add colours, the result looks like this:

![rogue](/images/rogue1.png)

In [part three](/roguelike-3-generating-an-island/), I will explain how I generated that island above. 