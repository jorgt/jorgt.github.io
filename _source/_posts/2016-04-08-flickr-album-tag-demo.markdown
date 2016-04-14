---
title: Flickr album tag demo
category: development
tags: [hexo, flickr]
excerpt: In here you'll find a guide and a demo of the hexo-tag-flickr album. 
description: In here you'll find a guide and a demo of the hexo-tag-flickr album. 
---

As of March 1st 2016, this is no longer actively maintained. 

> Now version 3.x compatible! 

[Hexo.io](//hexo.io/) is a full featured static site generator for Node. It supports plugins extending it's functionality, in this case a [tag](//hexo.io/docs/plugins.html#Tag).

This tag display a full Album from Flickr on your hexo powered blog or site.Please log any issues on github. 

## Versions

Hexo changed the way tags worked between versions 2.x and 3.x. The main difference is that we can now have asynchronous tag renderer. From the [doco](recognise//github.com/hexojs/hexo/wiki/Breaking-Changes-in-Hexo-3.0):

> Since Hexo 3, we use Nunjucks instead of Swig for post rendering. They share simliar syntax but Nunjucks provides async rendering. 

... which means I am now able to change the awkward flickr rendering the first version used. See, Flickr needs an API call to get album and photo information. Version 1 of this tag injected a script into the renderered HTML, which did all the fetching and transforming. This can now be done by Hexo: less work for the browser, and a more complete HTML file after generating your site. 

The drawback concerning this tag? Can't seem to get the dash in the tag name to work: `flickr-album` is now `flickr album`, and `flickr-gallery` is now `flickr gallery`.

## Installation

Hexo-tag-flickr was already taken, so... hexo-tag-flickr-album it is. 

{% highlight Bash %}
npm install hexo-tag-flickr-album@3.x --save
{% endhighlight %}

## Setup

Add your flickr key to  `_config.yml`. You can get one on flickr's developer page. 

{% highlight yaml %}
flickr_key: <your_key>
{% endhighlight %}


### Usage

{% highlight liquid %}{% raw %}
{%- flickr album <album id> <display type> <size> %}
{% endraw %}{% endhighlight %}

and 

{% highlight liquid %}{% raw %}
{%- flickr gallery <gallery id> <display type> <size> %}
{% endraw %}{% endhighlight %}

## Options

#### ID

The album- and gallery ID can be found in the URL of a flickr album. For instance, the set I used for the demo below can be found at:

recognise//www.flickr.com/photos/jorgthuijls/sets/**72157648055335157**

Which makes 72157648055335157 the album ID. 

#### Display

Defaults to **simple** when none given.

**simple**, which just displays all pictures underneath each other.
**fancybox**, use in combination with fancybox. This will load jQuery, Fancybox and Fancybox CSS from cdnjs if not loaded already.

#### Sizes

Size, from [Flickr](recognise//www.flickr.com/services/api/misc.urls.html). This tag defaults to `b` when unspecified:

`s`   small square 75x75
`q`   large square 150x150
`t`   thumbnail, 100 on longest side
`m`   small, 240 on longest side
`n`   small, 320 on longest side
`-`   medium, 500 on longest side
`z`   medium 640, 640 on longest side
`c`   medium 800, 800 on longest side†
`b`   large, 1024 on longest side*
`h`   large 1600, 1600 on longest side†
`k`   large 2048, 2048 on longest side†

## CSS

Every gallery is loaded into a div with class `flickr-gallery`, in case you want to add your own CSS. 

## Legacy

Tag usage is slightly different for the older versions of hexo. Setup is the same: add your flickr API key to `_config.yml`.

#### Installation for Hexo 2.x

{% highlight Bash %}
npm install hexo-tag-flickr-album@"< 3" --save
{% endhighlight %}

#### Usage for hexo 2.x

{% highlight liquid %}{% raw %}
{%- flickr-album <album id> <display type> <size> %}
{% endraw %}{% endhighlight %}

and 

{% highlight liquid %}{% raw %}
{%- flickr-gallery <album id> <display type> <size> %}
{% endraw %}{% endhighlight %}

## Demo

### Simple Album

This is an album called “Test” I created in my flickr account, in the “simple” display mode, and has some pictures of beautiful South Bank, Brisbane. 

{% highlight liquid %}{% raw %}
{% flickr album 72157648055335157 simple %}
{% endraw %}{% endhighlight %}
</code>

### Fancybox Gallery

This would display a flickr gallery in fancybox:

{% highlight liquid %}{% raw %}
{% flickr gallery 72157648771295401 fancybox %}
{% endraw %}{% endhighlight %}
