---
title: Roguelike 3 - Generating an island
category: roguelike
tags: [games, javascript, html, roguelike]
excerpt: roguelikes are randomized adventure games, and it's really fun to try and make them yourself! This article has island generation. 
---

This is the third of several posts I'm writing to catalogue the development of my little roguelike. It focusses on how to generate and island.

- [Part 1](/roguelike-1-building-a-game-loop.html): Engine
- [Part 2](/roguelike-2-using-html-for-graphics.html): Using HTML as graphics
- [Part 3](/roguelike-3-generating-an-island.html): Island generation

<hr>

No Roguelike is complete without procedurally generating content. What I had in mind for this one is a three layered approach: At the top is an overworld, a land that acts as the map of the entire explorable world. Hills, forests, mountains, plains etcetera. Then, after deciding which part of the island the player wishes to explore, A "zoomed in" landscape based on that particular type of terrain, which can be navigated, with monsters to fight and things to discover. Finally, caves, dungeons, towers or villages to enter where loot can be gotten. In this blog entry I'm focussing on the generation of the overworld. I'll describe which ideas I have had, tried and discarded and which idea stuck for now. 

## Overworld

Biomes, or life zones, are an attempt to classify types of terrain based on the climate they occur in, based on altitude, precipitation and temperature (or a combination of those). One such classification for instance is [Holdridge Life Zones](//en.wikipedia.org/wiki/Holdridge_life_zones), but there are others (my first attempts recreated Holdridge, but I ended up simplifying it a bit)

For my island, I decided to generate a height- rain- and heatmap, and combine those into a geography. Height will drive things like the position of lakes and oceans, mountains and hills. Height also has an influence on temperature. Temperature determines if something is very hot or very cold, which has a large impact on the type of life found in certain area's. So does the amount of rainfall. Dry, hot places might become deserts, whereas wet, hot places could be rainforests. 

### The height map

#### Simple noise

In order to generate a believable height- or heatmap I needed a way to generate a coherent sort of randomness. One tried and tested method is using Perlin Noise. You can find a very useful explanation [here](//freespace.virgin.net/hugo.elias/models/m_perlin.htm), but suffice to say that it's sort of like adding a collection of waves. There are a few variables that influence Perline noise that will determine how varied it is. 

- **Octaves** determine the depth of the noise, or the number of waves used
- **Persistence** is the rate at which the amplitude of the wave changes
- **Frequency** is governs the length of the waves

I prepared a small demo of my first attempts. It's straight up, simple 2D noise. I included the variables described above so you can play with them if you want.

To stay in the spirit of the article, the graphics in all fiddles below are little HTML elements <i class="fa fa-smile-o"></i>

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/2r0zkoyp/embedded/result,js,html">
</iframe>

#### Geography

Looks great! My overworld will have peaks and valleys. Because all noise values are normalized values between 0 and 1, I could simply declare every coordinate with a value over 0.5 to be land, for instance. It would be better for our world to use a more believable height range. Rounded, the deepest parts of the ocean are about 10KM below the surface, and the heighest mountains are almost 9KM. For the sake of simplicity, everything over 0 is land and everything under 0 is water. 

In the simple noise example, this would look like this:

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/1sts3cck/embedded/result,js,html">
</iframe>

See? Lands and seas. The grid used actually contains the height of the coordinate.

After creating a map based on simple noise, and running around on it for a little while with my player `@` character, this didn't feel right. The edges, or borders of our world, are rather arbitrary and make it seem to randomly stop. This is not very realistic, I would always wonder how the world would continue. Not suitable for a finite sort of map. 

#### Wrappable noise

So, I decided to make "wrappable noise" instead, so that the little player guy is able to walk off one side of the map and come out the other, or I could simply center the map on the player, which is another way of saying that I would move the map, not the player. This would solve the edges problem! My world will be a complete world, where all sides flow into each other. Experiment a little with the fiddle below. Setting `repeats` to `1` will give a single map that will have **matching edges**, meaning that the left flows seamlessly into the right, and the top flows seamlessly into the bottom. My world is round! For a clearer view of this, try having the world repeat 2 or 4 times instead of 1 and see what happens. 

<iframe
  style="width: 100%; height: 500px;"
  scrolling="no" 
  src="//jsfiddle.net/jorgthuijls/yfyub54u/embedded/result,js,html">
</iframe>

Still, I found a pretty glaring drawback. Water will flow straight through and generate tiny islands that players will have a hard time getting to. What if I randomly start the player on a single-tiled little island?

#### Radial particles

Then I decided, I should just make an island. Particle deposition could help achieve that. Without going into heaps of detail, for my island it would mean that I take a random coordinate near the middle of the grid, incriment it's current value by 1, and then proceed to do that to a random neighbouring coordinate provided it has a value lower than the current coordinate. Find new neighbours x amount of times - this is the *lifespan*. Repeat this process by starting with a new random coordinate untill you're happy with the result. 

For a grid of size 75, as I've been using in the JSFiddles up until now, it looks pretty nice with 2000 repeats and a lifespan of 20. 

At the end the resulting grid is normalized down to a range between 0 and 1 - like our noise map. 

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/zwcb9jfk/embedded/result,js,html">
</iframe>


By itself this looks rather boring, especially when you're looking at it through the "land" button in the fiddle above. 

#### Combining both

It's easy to combine both ideas. First, create a particle map, and then apply some simple noise to it. Much more interesting shapes that never touch the side of the map - an island! This will still generate the occasional island, and I'll be ironing that out... 

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/q4zq0seL/embedded/result,js,html">
</iframe>

## The heat map

Height I found to be the most influential in terms of the shape of the land. For heat and rainfall I simply chose to use the wrappable noise described above. In an attempt to make heat more realistic, I decided to center it around the halfway point on the Y axis, simulating an equator. 

Since noise is a value between 0 and 1, these were also converted into a more earth-like range. The warmest and coldest temperatures on earth are roughly between [-90 and +60 degrees Celsius](//en.wikipedia.org/wiki/List_of_weather_records#Other_high-temperature_records). I found though that in an ordinary noisemap these values produce to many lows, so I tweaked this a bit. 

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/zoocgfpq/embedded/result,js,html">
</iframe>

Something a heatmap cannot show by itself is the effect of altitude on temperature. For instance, seas below a certain level hardly ever change, and are always between [0 and +3 Celcius](//en.wikipedia.org/wiki/Deep_ocean_water). Going up, temperature drops by rougly [6.5 degrees Celcius for every 1000M of elevation](//en.wikipedia.org/wiki/International_Standard_Atmosphere). This will be taken into account when combining the heightmap and the heatmap. 

## The rain map

A rainmap is the last thing left to generate before we can combine them into a proper island. Rain is the hardest because rain patterns are associated with areas of rising air and low pressure, which in turn are governed by temperature and height. In warmer regions, hot air rises and create significant vertical lift, which is enhanced by the presence of mountains (and the direction of the wind). In colder regions precipitation is low because air is to cold to contain much water. It also does not rise as quickly or as high as hot air.  

TIL: When researching the ranges of rainfall, I can across the town of [Mawsynram](//en.wikipedia.org/wiki/Mawsynram) in India, considered the wettest town on earth with an average of about 12,000MM of rain per annum, and a record of over 26,000MM. The driest place has to be the [Atacama desert](//en.wikipedia.org/wiki/Atacama_Desert), with rainfall of less than 15MM. I decided to aim for 100mm to 16000mm. 

There are other factors to play with still. For instance, some of the world's wettest places are monsoonal - loads of rain in a few months, and then nothing for a while. Others have near-continuous drizzle, or maybe occasionally it can become hail. I will probably address those when I convert a wet part of the island into a landscape. More on this in future updates...

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/xLk7bn84/embedded/result,js,html">
</iframe>

## Generating a biome

Rests us combining rain, height and heat into a single climatized map. To add some additional randomness, not every generated world is equally wet or equally hot, so the ranges mentioned above are tweaked with a random percentage with the generation of every island. That means that some maps are wetter, hotter or higher than others. 

<iframe
  style="width: 100%; height: 500px"
  src="//jsfiddle.net/jorgthuijls/5ecjqLyo/embedded/result,js,html">
</iframe>

Cool? Or not cool? Either way, I quite like it so I'll use this as the base of my game. 

Next update I'll talk about generating landscapes based on a particular climate. Check back soon!