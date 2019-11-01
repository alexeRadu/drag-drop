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
		height	: zone.outerHeight(),
		occupied: false,
		get x() { return zone.offset().left; },
		get y() { return zone.offset().top; }
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
		get x() { return item.offset().left; },
		get y() { return item.offset().top;  }
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
			let oldXPos = scope.x;

			dropZoneNames = Object.keys(dropZones);
			for (i = 0; i < dropZoneNames.length; i++) {
				dzName = dropZoneNames[i];
				zone = dropZones[dzName];
				
				if (self.hitTest(zone.element, threshold) && (zone != scope.zone) && (dzName == "nav" || !zone.occupied)) {
					zone.occupied = true;
					scope.zone.occupied = false;	
					scope.zone = zone;
					scope.item.appendTo(zone.element);
					
					break;
				} 

			}
			
			if (scope.zone.name == "nav") {
				TweenLite.set(scope.item, { x: 0, y:  0});
			} else {
				TweenLite.set(scope.item, { x: 0, y:  scope.zone.height - scope.height});
			}
			
			// TweenLite.set(scope.item, { x: 0, y:  scope.zone.height - scope.height});
			// TweenLite.set(scope.item, {x: oldXPos - scope.zone.x, y: scope.zone.height - scope.height});
		}
	});

	return scope.draggable;
}




