#Leta#

@description
-------------
a simple/poor framework of javascrit

### Leta.$get
> selector

    basic
    #foo {} id
    .bar {} class
    a#foo.bar {} element attribute combinations

    attributes
    #foo a[href] {} simple
    #foo a[href=bar] {} attribute values
    #foo a[lang|=en] {} subcodes
    #foo a[title~=hello] {} attribute contains
    #foo a[href^="http://"] {} attribute starts with
    #foo a[href$=com] {} attribute ends with
    #foo a[href*=twitter] {} attribute wildcards

    descendants
    #foo a {} all descendants
    ul#list > li {} direct children

    siblings
    span ~ strong {} all adjacent
    p + p {} immediate adjacent

    combos
    div,p {}

    variations
    #foo.bar.baz {}
    div#baz.thunk a[-data-info*="hello world"] span + strong {}
    #thunk[title$='huzza'] {}

	
        Leta.$get('div#test.current')
        
### Leta.$dom
> dom[list] wrapper

    var el = document.getElementById('test');
    Leta.$dom(el)
    .css({
        width: ...,
        height: ...
    })
    .html('just a test')
    .appendTo('body');
    
    
    var els = document.querySelectorAll('.test');
    Leta.$dom(els)
    .show()
    .css(..)
    ...
    
### Leta.event
> event handler

    var el = document.getElementById('test');
    // base
    Leta.event.on(el, 'click', function (e) { ... });
    Leta.event.off(obj, 'click' [, listener]);
    Leta.event.fire(obj, 'click'); // custom events is also supported
    
    // event namespace
    Leta.event.on(el, 'mouseenter.test1', onmouseeventer);
    Leta.event.off(el, 'mouseenter.test1');
    
    // delegate
    var ul = document.getElementsByTagName('ul')[0];
    Leta.event.on(ul, 'li', 'click', function (e) {
        ...
    });
    
    // event dispatch
    <a href="#" data-cmd="sayHello" >say hello</a>
    Leta.event.dispatch(document.body, 'click.dispatch', {
        'sayHello': function (e, target) {
            ...
        },
        'otherCommand': function () {...}
    })
    
### Leta.fx
> dom animation
    
    var els = Leta.$get('.test');
    Leta.fx(els, {
        opacity: 0,
        width: '+=100',
        
        duration: 1000,
        complete: function () {}
        easing: ...
        bezier: ...
    });
    
    
### Leta.$
> sth. like jQuery

    Leta.$('a[data-cmd]')
    .css({
        ...
    })
    .html(...)
    .on('click', function (e) {
        ...
    });
