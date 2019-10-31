/*
///////////////////////////////////////////////////////////////////////////////////
// DRAGGING AN ELEMENT OUTSIDE A SCROLLABLE CONTAINER
///////////////////////////////////////////////////////////////////////////////////

HOW IT WORKS...

The app starts off by creating clones for each tile using the scope listed below.
When the user clicks on a tile, startDraggable is called, which enables the 
draggable instance to be dragged. When this happens, the real tile is hidden, 
with the clone taking its place. Because the clone is not actually inside the 
overflow container, it can be dragged anywhere. When the dragging stops, the clone
goes back to a hidden state.

SCOPE
- element: the tile element located in the #scroll-box
- wrapper: the element's parent, used to animate the space collapsing around a tile
- clone: a clone of the element that gets appended to the #clone-container
- dropped: is true when the tile is appended to the #drop-panel
- moved: is true when the tile has been dragged outside of its wrapper
- draggable: the draggable instance used by the clone
- x,y: getters that return the start position of the element 
- width: the width of the wrapper

START DRAGGABLE 
- moves the clone to the tile's position
- toggles the visibility between the element and clone
- starts the draggable instance by passing in the pointer event to its startDrag method

ON DRAG
- checks if the clone is outside of the wrapper using hitTest
- if true, it animates the space collapsing where the tile used to be

ON RELEASE
- checks if the clone is inside the drop panel using hitTest
- if it's inside and not already dropped, the wrapper is appended to the panel

MOVE BACK
- animates the wrapper space expanding
- animates the clone moving back to its starting position
- toggles the visibility between the clone and tile




///////////////////////////////////////////////////////////////////////////////////
// CHANGES 
///////////////////////////////////////////////////////////////////////////////////

ATTRIBUTES
Added attributes to elements to create drop zones, which are added to the
dropZones obejct.

<div drop-zone="name" sorted="true>
  <div class="clone-container"">
    <div class="letter-container"></div>
  </div>
</div>

SCOPE
All the letter scopes are added to the letters array. The getPrevious function 
uses the array to return a filtered list of all the letters that are in the same
zone and have a lower index. The array is reverse order, so the first letter
returned in the filterd list will be the previous element. If no results are
returned, then it's either the first element or the zone is empty. If sorted 
is set to false, the getPrevious just returns values to do a normal append to
the letter container.

///////////////////////////////////////////////////////////////////////////////////
*/

var threshold = "60%";
var dropZones = {};
var letters   = [];

$("[drop-zone]").each(function() {

  var zone = $(this);
  var name = zone.attr("drop-zone");

  dropZones[name] = {
    element : zone,
    name    : name,
    sorted  : zone.data("sorted"),
    clones  : zone.find(".clone-container"),
    letters : zone.find(".letter-container")
  };
});

$(".tile").each(function(index) {

  var element = $(this);
  var wrapper = element.parent();
  var offset  = element.position();
  var zone    = dropZones.main;

  var scope = {
    clone   : element.clone().attr("clone", "").prependTo(zone.clones),
    element : element,
    wrapper : wrapper,
    width   : wrapper.outerWidth(),
    height  : wrapper.outerHeight(),
    moved   : false,
    index   : index,
    zone    : zone,
    get x() { return getPosition(wrapper, this.zone.clones, offset).x; },
    get y() { return getPosition(wrapper, this.zone.clones, offset).y; },
    get cloneX() { return getPosition(this.clone, this.zone.clones).x; },
    get cloneY() { return getPosition(this.clone, this.zone.clones).y; },
    get previous() { return getPrevious(this, this.zone); }
  };

  scope.draggable = createDraggable(scope);

  // reversed order
  letters.unshift(scope);

  element.on("mousedown touchstart", scope, startDraggable);
});


// START DRAGGABLE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function startDraggable(event) {

  var letter = event.data;

  // Maak element onzichtbaar
  // Maak kloon zichtbaar en verplaats deze naar de coordinaten van het element
  TweenLite.set(letter.element, { autoAlpha: 0 });
  TweenLite.set(letter.clone, { x: letter.x, y: letter.y, autoAlpha: 1 });


  letter.draggable.startDrag(event.originalEvent);
}

// GET PREVIOUS :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function getPrevious(letter, zone) {

  if (!zone.sorted) {
    return { target: zone.letters, insert: "appendTo"};
  }

  var values = letters.filter(function(value) {
    return value.zone === letter.zone && value.index < letter.index;
  });

  return {
    target: values[0] ? values[0].wrapper : zone.letters,
    insert: values[0] ? "insertAfter" : "prependTo"
  };
}

// CREATE DRAGGABLE :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function createDraggable(letter) {

  var clone   = letter.clone;
  var wrapper = letter.wrapper;

  letter.draggable = new Draggable(clone, {
    onPress   : setActive,
    onDrag    : collapseSpace,
    onRelease : dropTile
  });

  return letter.draggable;
  ///////

  function setActive() {
    TweenLite.to(clone, 0.15, { scale: 1.2, autoAlpha: 0.75 });
  }

  function collapseSpace() {
    if (!letter.moved) {
      if (!this.hitTest(wrapper)) {
        letter.moved = true;
        TweenLite.to(wrapper, 0.3, { width: 0, height: 0 });
      }
    }
  }

  function dropTile() {

    var name = undefined;
    var self = this;

    $.each(dropZones, function(key, zone) {

      if (self.hitTest(zone.element, threshold) && letter.zone !== zone) {

        name = "tile " + zone.name;
        letter.zone = zone;

        // Get the previous element and the insert method
        var previous = letter.previous;
        wrapper[previous.insert](previous.target);

        // Position the clone inside its new container
        TweenLite.set(clone, { x: letter.cloneX, y: letter.cloneY });
        zone.clones.prepend(clone);
      }
    });

    moveBack(letter, name);
  }
}

// MOVE BACK ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function moveBack(letter, className) {

  var clone   = letter.clone;
  var element = letter.element;
  var wrapper = letter.wrapper;

  TweenLite.to(wrapper, 0.2, { width: letter.width, height: letter.height });
  TweenLite.to(clone, 0.3, { scale: 1, autoAlpha: 1, x: letter.x, y: letter.y, onComplete: done, delay: 0.02 });
  
  if (className) TweenLite.to([element, clone], 0.3, { className: className });

  function done() {
    letter.moved = false;
    TweenLite.set(clone, { autoAlpha: 0 });
    TweenLite.set(element, { autoAlpha: 1 });
  }
}

// GET POSITION :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
function getPosition(target1, target2, offset) {

  var position1 = target1.offset();
  var position2 = target2.offset();

  offset = offset || { left: 0, top: 0 };

  return {
    x: position1.left - position2.left + offset.left,
    y: position1.top  - position2.top  + offset.top
  };
}





