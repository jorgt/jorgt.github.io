---
tags: [sapui5, openui5]
category: development
excerpt: UI5 does not come with swipe-to-navigate functionality out of the box. Here's how I implemented this for a PhoneGap app I built at work recently.
---

# Introduction

After digging around in the UI5 examples and code, I was unable to find a mobile application that supported swipe-to-navigate pages, and I needed some for a project. Swipe to navigate means, you use your finger to navigate between pages by swiping left or right: left will take you back, right will take you forward. Turns out, it wasn't very hard to build. Here's what I did.

Have a peek at the [GitHub repository](//github.com/jorgt/ui5-mobile-swipe-navigation), it contains all the code here so you can try it for yourself. It's not a bad base to start with either. 

To wet your appetite, this is what we're making:

![](/images/screen.gif)

## What's needed

We need four things:

- Swipe events, so the app can detect when someone is putting their fingers on the screen and moving them in a particular direction
- Slide animations. The slide animation that comes with UI5 out-of-the-box is only right-to-left, so we need one going in the other direction. 
- A way to identify the next or previous page
- Combining everything by attaching the swipe event and animation to an `app.to` call. 

And of course we need an application to build this into. I'm using `grunt`[^grunt], `bower`[^bower] and a UI5 Component to bootstrap an application. My abbreviated project's code structure looks like this:

[^grunt]: I'm talking about [Grunt JS](//gruntjs.com/), an automation tool for command line related tasks.

[^bower]: [Bower](//bower.io/) is a package manager for front end related scripts, in the same sense that NPM is for node packages, APT is the debian and ubuntu package manager, and OSX has Brew. 

{% highlight bash %}
root
|-- package.json
|-- bower.json
|+- src
|   |-- Component.js
|   |-- index.html
|   |+- controller
|   |   |-- App.controller.js
|   |+- model
|   |+- views
|   |   |-- App.view.xml
|   |   |-- Page1.view.xml
|   |   |-- Page2.view.xml
|   |   |-- Page3.view.xml
{% endhighlight %}

The code that matters for this is all in `Component.js`, `App.controller.js` and `App.view.xml`. 

For full code, please refer to the Git repository. 

### Swipe events

Conveniently, UI5 provides those for us, so: score. The events `swipe-left` and `swipe-right` are perfect for this. On non-mobile devices they're also triggered by holding down the mouse button and swiping so that's a bonus. 

### Swipe Animations

The page animations in UI5 are declared in `sap.m.NavContainer`[^navcontainer].We *could* create a fully custom one, but we can also realize that swiping from left-to-right is identical to right-to-left --- only in reverse!

[^navcontainer]: Here's a link to the [API document](recognise//openui5.hana.ondemand.com/docs/api/symbols/sap.m.NavContainer.html). You can see the `to` and `back` code for yourself.

This means, lucky us, that we can use the default `slide` animation and flip it. Here's a link to the [code](recognise//github.com/SAP/openui5/blob/master/src/sap.m/src/sap/m/NavContainer.js#L951). You'll notice it has a `to` and a `back` component. 

{% highlight javascript %}
init: function() {
    //attach animations
    this._setUpSwipeAnimations();

    //other things

    //call parent method
    UIComponent.prototype.init.call(this, arguments);
},

_setUpSwipeAnimations: function() {
    var slide = NavContainer.transitions.slide;

    //technically, swiping from left to right just means
    //reversing the "to/back functions" of the existing slide animation
    NavContainer.transitions["slide-left"] = slide;

    NavContainer.transitions["slide-right"] = {
        to: slide.back,
        back: slide.to
    };      
}
{% endhighlight %}

This lives in `Component.js`. The code takes the default slide animation, and re-attaches it to the `NavContainer`, renamed as `slide-left`. It is then added again as `slide-right`, only the `to` and `back` parts are switched. That is all!

By adding this code in the `init` portion of the Component, and before the call the parent `init` method, it's ready for action by the time the app itself is boostrapped.

### Identifying pages

I like to keep things dynamic. Thankfully, by keeping the pages` class name and ID similar, this can be achieved with relatively little code:

{% highlight XML %}
<Page backgroundDesign="Solid" class="swipe-page">
{% endhighlight %}

By adding the same classname to all pages, an the event can be attached to just the HTML bits that we like. In this case, all my pages have the class `swipe-page` attached to them. 

The last thing is adding the pages to the app in the right order in App view:

{% highlight XML %}
<mvc:View 
    xmlns:mvc="sap.ui.core.mvc" 
    xmlns:core="sap.ui.core" 
    xmlns="sap.m" 
    controllerName="holcim.swipedemo.controller.App" 
    displayBlock="true"
    resourceBundleName="holcim.swipedemo.i18n.i18n" 
    resourceBundleAlias="i18n"
    id="swipedemo-view">
    <Shell>
        <App id="swipedemo-app">
          <mvc:XMLView id="swipe-page1" viewName="holcim.swipedemo.view.Page1" />
          <mvc:XMLView id="swipe-page2" viewName="holcim.swipedemo.view.Page2" />
          <mvc:XMLView id="swipe-page3" viewName="holcim.swipedemo.view.Page3" />
        </App>
    </Shell>
</mvc:View>
{% endhighlight %}

Observe the multitude of ID's here: the main view is called `swipedemo-view`, the app is called `swipedemo-app` and all the pages have numbered ID's: `swipe-page1` to .. however many pages you have. 

This way we can determine the next page and the previous page. 

### Putting it together

The best place to link everything together is in the initialization phase of the App controller. This way the animations are ready to be used, and the code belonging to swiping the app is actually inside the correct controller. 

{% highlight javascript %}
return Controller.extend("holcim.swipedemo.controller.App", {
    onInit: function() {
        this._setupTransitions();
    },

    _setupTransitions: function() {
        $('body').on('swipeleft', '.swipe-page', function(e) {
            this._navigate(e.currentTarget.parentNode.id, 'left');
        }.bind(this));

        $('body').on('swiperight', '.swipe-page', function(e) {
            this._navigate(e.currentTarget.parentNode.id, 'right');
        }.bind(this));
    },

    _navigate: function(id, direction) {
        var newId, match, add;

        match = id.match(/.*swipe-page([0-9]{1,}$)/);
        add = (direction === 'left') ? 1 : -1
        if (match && match.length > 1) {
            newId = this.createId('swipe-page' + (Number(match[1]) + add));
            this.byId('swipedemo-app').to(newId, 'slide-' + direction);
        }
    }
});
{% endhighlight %}

Let's break that down. The first interesting block of code is this one:

{% highlight javascript %}
$('body').on('swipeleft', '.swipe-page', function(e) {
    this._navigate(e.currentTarget.parentNode.id, 'left');
}.bind(this));
{% endhighlight %}

This attached a handler to the body of the page for the `swipeleft` event, [limited](//api.jquery.com/on/) to class `swipe-page`. Without the class addition, this triggers on elements overlaying the page itself as well like header elements, lists, tables, forms and anything else you might have on there. By filtering on this class, the event's `currentTarget` always contains a page.

The same code is attached to the `swiperight` event. 

Second code block is the function that does the navigating:

{% highlight javascript %}
_navigate: function(id, direction) {
    var newId, match, add;

    match = id.match(/.*swipe-page([0-9]{1,}$)/);
    add = (direction === 'left') ? 1 : -1
    if (match && match.length > 1) {
        newId = this.createId('swipe-page' + (Number(match[1]) + add));
        this.byId('swipedemo-app').to(newId, 'slide-' + direction);
    }
}
{% endhighlight %}

This takes the current target's ID, which is something like `__xmlview0--swipe-page1`. To get the right page number, all we need is to get the number at the end of the string, here collected in regex array `match`, and either add 1 or subtract 1, depending on the direction of the swipe. 

Thanksfully, it doesn't matter if the page you're trying to navigate to doesn't exist. UI5 will not throw an error, although you might see a warning in the console.