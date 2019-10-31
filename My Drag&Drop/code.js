var threshold = "60%";
var dropZones = {};
var items     = [];

$("[drop-zone]").each(function() {
	var zone = $(this);
	var name = zone.attr("drop-zone");

	dropZones[name] = {
		element : zone,
		name    : name,
		width	: zone.outerWidth(),
		height	: zone.outerHeight()
	};
});

$(".drop-item").each(function(index) {
	var item = $(this);

	var scope = {
		item  	: item,
		index 	: index,
		zone  	: dropZones["nav"],
		width	: item.outerWidth(),
		height	: item.outerHeight(),
		get x() { return item.position().left; },
		get y() { return item.position().top;  }
	};

	scope.draggable = createDraggable(scope);

	items.push(scope);

	item.on("mousedown touchstart", scope, startDraggable);
});


function startDraggable(event) {
	var scope = event.data;
	scope.draggable.startDrag(event.originalEvent);
}

function createDraggable(scope) {
	scope.draggable = new Draggable(scope.item, {
		onRelease : function () {
			var self = this;

			$.each(dropZones, function(key, zone) {
				if (self.hitTest(zone.element, threshold)) {
					scope.zone = zone;
					scope.item.prependTo(zone.element);
					
					if (zone.name == "nav") {
						scope.item.attr("position", "relative");
						TweenLite.set(scope.item, { x: 0, y:  0});
					} else {
						scope.item.attr("position", "absolute");
						TweenLite.set(scope.item, { x: 0, y:  zone.height - scope.height});
					}
				}
			});
		}
	});

	return scope.draggable;
}




